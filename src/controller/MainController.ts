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
        return this.userEditsFoodController.all(response)
    }
    async userEditsFoodOne(request: Request, response: Response, next: NextFunction, channel: Channel) {
        return this.userEditsFoodController.one(request.params.id, response)
    }
    async userEditsFoodUpdate(request: Request, response: Response, next: NextFunction, channel: Channel) {
        return this.userEditsFoodController.update(request.params.id, request.body, response)
    }
    async userEditsFoodSave(request: Request, response: Response, next: NextFunction, channel: Channel) {
        return this.userEditsFoodController.save(request.body, response)
    }
    async userEditsFoodRemove(request: Request, response: Response, next: NextFunction, channel: Channel){
        return this.userEditsFoodController.remove(request.params.userEditsFoodId, response)
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
                channel.publish("FoodEdits", "additive.save", Buffer.from(JSON.stringify(result)))
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
                channel.publish("FoodEdits", "additive.remove", Buffer.from(JSON.stringify({id: request.params.id})))
            }
            else{
                response.status(400)
            }
            response.send(result)
        })
    }
    // allergen
    async allergenAll(request: Request, response: Response, next: NextFunction, channel: Channel) {
        return this.allergenController.all(response)
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