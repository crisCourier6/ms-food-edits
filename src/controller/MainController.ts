import { NextFunction, Request, Response } from "express"
import { UserEditsFoodController } from "./UserEditsFoodController"
import { FoodLocalController } from "./FoodLocalController"
import { AllergenController } from "./AllergenController"
import { AdditiveController } from "./AdditiveController"
import { Channel } from "amqplib"

export class MainController{

    private userEditsFoodController = new UserEditsFoodController
    private foodLocalController = new FoodLocalController
    private allergenController = new AllergenController
    private additiveController = new AdditiveController
    // user edits food
    async userEditsFoodAll(request: Request, response: Response, next: NextFunction, channel: Channel) {
        return this.userEditsFoodController.all(request, response)
    }
    async userEditsFoodOne(request: Request, response: Response, next: NextFunction, channel: Channel) {
        return this.userEditsFoodController.one(request.params.id, response)
    }
    async userEditsFoodUpdate(request: Request, response: Response, next: NextFunction, channel: Channel) {
        console.log(request.params.id, request.body)
        await this.userEditsFoodController.update(request.params.id, request.body, response)
        .then (result => {
                channel.publish("FoodEdit", 
                    "submission.judged",  
                    Buffer.from(JSON.stringify({
                        userId: request.body.idUser,
                        judgeId: request.body.idJudge,
                        rejectReason: request.body.rejectReason,
                        state: request.body.state,
                        foodName: request.body.foodData.product_name
                    }))
                )
                if (request.body.state === "accepted"){
                    if (request.body.type === "edit"){
                        const newFood = request.body.foodData
                        let fullname = newFood.product_name

                        if(newFood.brands){
                            fullname = fullname + "-" + newFood.brands.split(",")[0]
                        }
                        if (newFood.quantity){
                            fullname = fullname + "-" + newFood.quantity
                        }
                        channel.publish("FoodEdit", "food-local.update", Buffer.from(JSON.stringify({
                            foodData: request.body.foodData,
                            id: request.body.idFood,
                            name: fullname
                        })))
                    }
                    else if (request.body.type === "new"){
                        const newFood = request.body.foodData
                        let fullname = newFood.product_name

                        if(newFood.brands){
                            fullname = fullname + "-" + newFood.brands.split(",")[0]
                        }
                        if (newFood.quantity){
                            fullname = fullname + "-" + newFood.quantity
                        }
                        channel.publish("FoodEdit", "food-local.new", Buffer.from(JSON.stringify({
                            foodData: request.body.foodData,
                            id: request.body.idFood,
                            name: fullname
                        })))
                    }
                    
                }
                response.send(result)
        })
    }
    async userEditsFoodSave(request: Request, response: Response, next: NextFunction, channel: Channel) {
        return this.userEditsFoodController.save(request.body, response)
    }
    async userEditsFoodRemove(request: Request, response: Response, next: NextFunction, channel: Channel){
        return this.userEditsFoodController.remove(request.params.id, response)
    }
    // food local
    async foodLocalAll(request: Request, response: Response, next: NextFunction, channel: Channel) {
        return this.foodLocalController.all(response)
    }
    async foodLocalOne(request: Request, response: Response, next: NextFunction, channel: Channel) {
        return this.foodLocalController.one(request.params.id, response)
    }
    // additives
    async additiveAll(request: Request, response: Response, next: NextFunction, channel: Channel) {
        return this.additiveController.all(response)
    }
    async additiveOne(request: Request, response: Response, next: NextFunction, channel: Channel) {
        return this.additiveController.one(request.params.id, response)
    }
    async additiveUpdate(request: Request, response: Response, next: NextFunction, channel: Channel) {
        return this.additiveController.update(request.params.id, request.body, response)
    }
    async additiveSave(request: Request, response: Response, next: NextFunction, channel: Channel) {
        await this.additiveController.save(request.body, response)
        .then(result => {
            if (result){
                channel.publish("FoodEdit", "additive.save", Buffer.from(JSON.stringify(result)))
            }
            else{
                response.status(400)
            }
            response.send(result)
        })
    }
    async additiveRemove(request: Request, response: Response, next: NextFunction, channel: Channel){
        await this.additiveController.remove(request.params.id, response)
        .then(result => {
            if (result){
                channel.publish("FoodEdit", "additive.remove", Buffer.from(JSON.stringify({id: request.params.id})))
            }
            else{
                response.status(400)
            }
            response.send(result)
        })
    }
    // allergen
    async allergenAll(request: Request, response: Response, next: NextFunction, channel: Channel) {
        return this.allergenController.all()
    }
    async allergenOne(request: Request, response: Response, next: NextFunction, channel: Channel) {
        return this.allergenController.one(request.params.id, response)
    }
    async allergenSave(request: Request, response: Response, next: NextFunction, channel: Channel) {
        await this.allergenController.save(request.body, response)
        .then(result => {
            if (result){
                channel.publish("FoodEdits", "allergen.save", Buffer.from(JSON.stringify(result)))
            }
            else{
                response.status(400)
            }
            response.send(result)
        })
    }
    async allergenRemove(request: Request, response: Response, next: NextFunction, channel: Channel){
        await this.allergenController.remove(request.params.id, response)
        .then(result => {
            if (result){
                channel.publish("FoodEdits", "allergen.remove", Buffer.from(JSON.stringify({id: request.params.id})))
            }
            else{
                response.status(400)
            }
            response.send(result)
        })
    }
}