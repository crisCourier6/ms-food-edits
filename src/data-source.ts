import "reflect-metadata"
import { DataSource } from "typeorm"
import "dotenv/config"
import { UserEditsFood } from "./entity/UserEditsFood"
import { FoodLocal } from "./entity/FoodLocal"
import { Additive } from "./entity/Additive"
import { Allergen } from "./entity/Allergen"

// AppDataSource contiene la configuración de la conexión con la base de datos del microservicio
export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [UserEditsFood, FoodLocal, Additive, Allergen],
    migrations: [],
    subscribers: [],
})
