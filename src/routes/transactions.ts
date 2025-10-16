import { FastifyInstance } from "fastify"
import { z } from "zod"
import { knex } from "../database.js"
import { randomUUID } from "node:crypto"
import { text } from "node:stream/consumers"
import { allowedNodeEnvironmentFlags } from "node:process"
import { id } from "zod/locales"
import { where } from "sequelize"
import { checkSessionExist } from "../middlewares/check-session-id-exost.js"

// Cookies <-->  Fomras de manter contexto entre requisições

export async function transactionsRoutes(app: FastifyInstance){
    //adHoock , é global, mas só vale para o plugin atual, PARA SER USADO POR TODOS OS PLUGINS/ROTAS
    // Deve ser inserido no server.ts, antes do plugin
app.addHook("preHandler", async (request,reply)=>{
    console.log(`[${request.method} ${request.url}]`)
})

app.get("/",
    {
    preHandler:[checkSessionExist],
}, 
async (request, reply)=>{

    const { sessionId } = request.cookies

    const transactions = await knex("transactions")
    .where("session_id", sessionId).select()
   
    return { transactions }
})

app.get("/summary",{
    preHandler:[checkSessionExist],
},

 async(request)=>{
    const { sessionId } = request.cookies

    const summary = await knex("transactions").where("session_id", sessionId)
    .sum("amount",{as: "amount"})

    return {summary}
})


app.get("/:id",
    {
    preHandler:[checkSessionExist],
},
 async (request)=>{
    const getTransactionsParamsSchema = z.object({
        id: z.string().uuid(),
    })
    const { id } = getTransactionsParamsSchema.parse(request.params)
    
    const { sessionId } = request.cookies

    const transactions =  await knex("transactions").where({
        session_id: sessionId,
        id: id,
    }).first()

    return {transactions}
})

    // Primeira Transição do Usuário "/"
app.post("/",
     async(request, reply)=>{
    
    const createTransactionsSchema = z.object({
        title: z.string(),
        amount: z.number(),
        type: z.enum(["credit", "debit"]),
    })

    let sessionId = request.cookies.sessionId
    if(!sessionId){
        sessionId = randomUUID()

        reply.setCookie("sessionId", sessionId, {
            path:"/",
            maxAge: 60 * 60 * 24 * 7 // 7 Days
        })
    }

        
    const {title, amount, type} = createTransactionsSchema.parse(request.body)

    await knex ("transactions")
    .insert({
        id: randomUUID(),   
        title,
        amount: type === "credit" ? amount : amount * -1,
        session_id: sessionId,
        created_at: new Date().toISOString()

    })
    //(201 = Sucesso)

    return reply.status(201).send("Sucesso")
})
}