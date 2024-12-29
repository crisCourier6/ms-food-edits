import * as express from "express"
import * as bodyParser from "body-parser"
import { Request, Response } from "express"
import { AppDataSource } from "./data-source"
import { Routes } from "./routes"
import * as amqp from "amqplib/callback_api"
import { FoodLocalController } from "./controller/FoodLocalController"
import { Additive } from "./entity/Additive"
import { Allergen } from "./entity/Allergen"
import { UserController } from "./controller/UserController"
const path = require('path');


AppDataSource.initialize().then(async () => {
    amqp.connect(process.env.RABBITMQ_URL, (error0, connection) => {
        if(error0){
            throw error0
        }

        connection.createChannel((error1, channel)=>{
            if (error1){
                throw error1
            }
            const foodLocalController = new FoodLocalController
            const userController = new UserController
            channel.assertExchange("FoodEdit", "topic", {durable: false})

            channel.assertExchange("FoodProfile", "topic", {durable: false})
            channel.assertExchange("Accounts", "topic", {durable: false})

            channel.assertQueue("FoodEdit_FoodLocal", {durable: false})
            channel.bindQueue("FoodEdit_FoodLocal", "FoodProfile", "food-local.*")

            channel.assertQueue("FoodEdit_Accounts", {durable: false})
            channel.bindQueue("FoodEdit_Accounts", "Accounts", "user.*")

            // create express app
            const app = express()
            app.use(bodyParser.json())
            // register express routes from defined application routes
            Routes.forEach(route => {
                const controllerInstance = new (route.controller as any)();
                const action = controllerInstance[route.action].bind(controllerInstance);

                let middlewares: Function[] = [];
                
                if (controllerInstance.upload) {
                    // If the controller has an 'upload' middleware (multer), use it
                    middlewares.push(controllerInstance.upload.fields([
                        { name: 'ingredients', maxCount: 1 },
                        { name: 'front', maxCount: 1 },
                        { name: 'nutrition', maxCount: 1 },
                        { name: "packaging", maxCount: 1}
                    ]));
                }

                (app as any)[route.method](route.route, ...middlewares, (req: Request, res: Response, next: Function,) => {
                    const result = action(req, res, next, channel);
                    if (result instanceof Promise) {
                        result.then(result => result !== null && result !== undefined ? res.send(result) : undefined);
                    } else if (result !== null && result !== undefined) {
                        res.json(result);
                    }
                });
            })
            

            channel.consume("FoodEdit_FoodLocal", async (msg)=>{
                let action = msg.fields.routingKey.split(".")[1]
                let content = JSON.parse(msg.content.toString())
                if (action=="save"){
                    await foodLocalController.saveLocal(content)
                    .then(result=>{
                        console.log(result)
                    })
                }
                else if (action=="remove"){
                    await foodLocalController.remove(content.id)
                    .then(result=>{
                    })
                }    
            }, {noAck: true})

            channel.consume("FoodEdit_Accounts", async (msg)=>{
                let action = msg.fields.routingKey.split(".")[1]
                
                if (action=="create"){
                    let content = JSON.parse(msg.content.toString())
                    let trimmedContent = {...content, storeProfile:undefined, expertProfile:undefined, userHasRole:undefined}
                    await userController.create(trimmedContent)
                    .then(result=>{
                        console.log(result)
                    })
                    .catch(error=>console.log(error))
                }
                else if (action=="update"){
                    let content = JSON.parse(msg.content.toString())
                    let trimmedContent = {...content, storeProfile:undefined, expertProfile: undefined, userHasRole:undefined}
                    console.log("i should update the user with id: ", trimmedContent)
                    await userController.update(content)
                    .then(result=>{
                        console.log(result)
                    })
                    .catch(error=>console.log(error))
                }
                else if (action=="remove"){
                    let content = JSON.parse(msg.content.toString())
                    console.log("i should delete the user with id: ", content, ", which should delete all his submissions too")
                    await userController.remove(content)
                    .then(result=>{
                        console.log(result)
                    })
                    .catch(error=>console.log(error))
                }
            }, {noAck: true})

            // setup express app here
            // ...
            // ******************* Poblado de la tabla de aditivos *****************
            
            // const additives = require('../additives.json')
            // const additiveRepo = AppDataSource.getRepository(Additive)
            // for (const [code, value] of Object.entries(additives)){
            //     let name = value["name"]["es"]?value["name"]["es"]:null
            //     let vegan = false
            //     let vegetarian = false
            //     if (value["vegan"] && value["vegan"]["en"]==="yes"){
            //         vegan = true
            //     }
            //     if (value["vegetarian"] && value["vegetarian"]["en"]==="yes"){
            //         vegetarian = true
            //     }
            //     let wikidata = value["wikidata"]?value["wikidata"]["en"]:null
            //     let newAdditive = {
            //         id: code,
            //         name: name,
            //         vegan: vegan,
            //         vegetarian: vegetarian,
            //         wikidata: wikidata
            //     }
            //     additiveRepo.save(newAdditive)
            // }

            // ******************* Poblado de la tabla de alérgenos *****************
            
            // const allergen = require('../allergen.json')
            // const allergenRepo = AppDataSource.getRepository(Allergen)
            // for (const [code, value] of Object.entries(allergen)){
            //     let name = value["name"]["es"]?value["name"]["es"]:value["name"]["en"]
            //     let wikidata = value["wikidata"]?value["wikidata"]["en"]:null
            //     let newAllergen = {
            //         id: code,
            //         name: name,
            //         wikidata: wikidata
            //     }
            //     allergenRepo.save(newAllergen)
            // }

            // start express server
            app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
            app.listen(process.env.PORT)

            console.log(`Express server has started on port ${process.env.PORT}. Open ${process.env.HOST}:${process.env.PORT}/submissions to see results`)

        })
    })
}).catch(error => console.log(error))
