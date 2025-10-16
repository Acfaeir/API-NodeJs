import { config } from "dotenv"
import {z} from "zod"

if(process.env.NODE_ENV == "test"){
    config({path: ".env.test"})
} else{
    config()
}


//Formato de como vou receber os dados das var ambientes process.env
const envSchema = z.object({
    NODE_ENV: z.enum(["development","test","production"]).default("production"),
    DATABASE_CLIENT: z.enum(["sqlite", "pg"]),
    DATABASE_URL: z.string(),
    PORT: z.coerce.number().default(3333)
})
// PARSE, pega o esquema (oque tiver z.object e vai passar os dados que estão vindo de process.env
// e o ZOD automaticamente faz a validação)
const _env = envSchema.safeParse(process.env)
// SE FUNCIONAR O RESTANTE DO CÓDIGO VAI FUNCIONAR 

    if(_env.success === false){
        console.error("Invalid environment variables", _env.error.format())

        throw new Error("Invalid environment variables")
    }

    export const env = _env.data