import type { Knex } from "knex";

declare module "knex/types/tables"{
 interface Tables {
    transactions: Knex.CompositeTableType <{
      id: string
      title: string
      amount: number
      created_at: string
      session_id?: string
    }>
  }
}