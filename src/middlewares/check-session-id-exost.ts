import { FastifyReply, FastifyRequest } from "fastify"
import knex from "knex"

export async function checkSessionExist(request: FastifyRequest,reply: FastifyReply){
    
        const sessionId = request.cookies.sessionId
        if(!sessionId){
            return reply.status(401).send({error: " Não Autorizado"})
        }
    }        

