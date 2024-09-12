import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { FoodLocal } from "../entity/FoodLocal"
import { In } from "typeorm"

export class FoodLocalController {

    private foodLocalRepository = AppDataSource.getRepository(FoodLocal)

    //all()
    // entradas:
    // salidas: Array con todas las filas de la tabla food_local
    async all(res: Response) {
        return this.foodLocalRepository.find()
    }
    //one(id: string)
    // entradas: id: id del alimento que se quiere encontrar
    // salidas: undefined - si es que no se encuentra el alimento
    //          foodlocal - alimento 
    async one(id: string, res: Response) {
        const foodLocal = await this.foodLocalRepository.findOne({
            where: { id: id }
        })

        if (!foodLocal) {
            return undefined
        }
        return foodLocal
    }
    //getAllByIds(ids:any)
    // entradas: ids: Array con id de alimentos que se quieren encontrar
    // salidas: undefined - si es que no se encuentran alimentos
    //          foodLocals - Array de alimentos
    async getAllbyIds(ids: any, res: Response){
        const foodLocals = await this.foodLocalRepository.find({where: {id: In(ids)}})
        if (!foodLocals){
            return undefined
        }
        return foodLocals
    }
    //saveLocal(food:any)
    // entradas: food: objeto con la forma de FoodLocal que se quiere agregar al repositorio
    // salidas: undefined - si es que no se puede agregar food al repositorio
    //          createdFoodLocal - registro agregado al repositorio
    async saveLocal(food: any) {

       const createdFoodLocal = await this.foodLocalRepository.save(food) // si food.id ya existe en la tabla, save actualiza
       if (createdFoodLocal){                                             // el registro con los otros campos de food 
           return createdFoodLocal
       }
       return undefined
   }

    //update(id: any, food: any)
    // entradas: id: código de barras del alimento que se quiere actualizar
    //           food: objeto con la forma de FoodLocal
    // salidas: undefined - si es que no se puede agregar food al repositorio
    //          updatedFoodLocal - registro actualizad
    // ************* save puede cumplir el mismo rol de esta función ***********************************
    // ***** pero update recibe un objeto FoodLocal, save recibe un objeto desde OpenFoodFacts *********
    async update(id: any, food: any, res: Response) {
        const updatedFoodLocal = await this.foodLocalRepository.update(id, food)
        if (updatedFoodLocal){
            return updatedFoodLocal
        }
        return undefined
        
    }
    // remove(id: string)
    // entradas: id: código de barras del alimento que se quiere eliminar
    // salidas: undefined - si es que no existe el alimento 
    //          removedFood - registro eliminado
    async remove(id: string) {
        let foodLocalToRemove = await this.foodLocalRepository.findOneBy({ id: id })

        if (!foodLocalToRemove) {
            return undefined
        }

        const removedFood = await this.foodLocalRepository.remove(foodLocalToRemove)

        return removedFood
    }

}