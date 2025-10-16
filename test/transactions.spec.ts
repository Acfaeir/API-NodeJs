import { afterAll, beforeAll, test, describe, it, expect, beforeEach } from "vitest"
import request from "supertest"
import { app } from "../src/app"
import { execSync } from "child_process"

// Rodando testes E2E

describe("Transactions Routes",()=>{
    
beforeAll( async()=>{
    await app.ready()
})

afterAll(async()=>{
    await app.close()
})

beforeEach(() =>{
    // A cada teste eu apago o banco e rodo novamente
    execSync("npm run knex migrate:rollback --all") 
    execSync("npm run knex migrate:latest")
})

  test("O usuario consegue criar uma nova transição", async()=>{
    const response = await request(app.server)
    .post("/transactions")
    .send({
        title: "New Tes23",
        amount: 12345,
        type: "credit"
    })
    .expect(201)

})

  it("Should be able to list all transactions", async()=>{
    const createTransactionsResponse = await request(app.server)
    .post("/transactions")
    .send({
        title:"New Transaction",
        amount: 43545,
        type: "credit",
    })
    const cookies = createTransactionsResponse.get("Set-Cookie")
    // Após receber o id cookies, inicia a rota para listar
    const ListTransactionsResponse = await request(app.server)
    .get("/transactions")
    .set("Cookie", cookies)
    .expect(200)

    expect(ListTransactionsResponse.body.transactions).toEqual([
        expect.objectContaining({
            title: "New Transaction",
            amount: 43545
        })
    ])  
})

  it("Should be able to get a specific transactions", async()=>{
    const createTransactionsResponse = await request(app.server)
    .post("/transactions")
    .send({
        title:"New Transaction",
        amount: 43545,
        type: "credit",
    })
    const cookies = createTransactionsResponse.get("Set-Cookie")
    // Após receber o id cookies, inicia a rota para listar
    const ListTransactionsResponse = await request(app.server)
    .get("/transactions")
    .set("Cookie", cookies)
    .expect(200)

    const transactionsId = ListTransactionsResponse.body.transactions[0].id

    const GetTransactionsResponse = await request(app.server)
    .get(`/transactions/${transactionsId}`)
    .set("Cookie", cookies)
    .expect(200)


    expect(GetTransactionsResponse.body.transactions).toEqual(
        expect.objectContaining({
            title: "New Transaction",
            amount: 43545
        })
    ) 
})

  it("Should be able to get a summary transactions", async()=>{
    const createTransactionsResponse = await request(app.server)
    .post("/transactions")
    .send({
        title:"New Transaction",
        amount: 5000,
        type: "credit",
    })
    const cookies = createTransactionsResponse.get("Set-Cookie")

     await request(app.server)
    .post("/transactions")
    .set("Cookie", cookies)
    .send({
        title:"Debit transaction",
        amount: 2000,
        type: "debit",
    })

    // Após receber o id cookies, inicia a rota para listar
    const SumamaryResponse = await request(app.server)
    .get("/transactions/summary")
    .set("Cookie", cookies)
    .expect(200)

    expect(SumamaryResponse.body.summary).toEqual([{
        amount: 3000,
    }])
  })
})