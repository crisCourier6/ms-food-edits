import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { Allergen } from "../entity/Allergen"
import { In } from "typeorm"

export class AllergenController {

    private allergenRepository = AppDataSource.getRepository(Allergen)

    //all()
    // entradas:
    // salidas: Array con todas las filas de la tabla food_local
    async all(res: Response) {
        return this.allergenRepository.find()
    }
    //one(id: string)
    // entradas: id: id del alimento que se quiere encontrar
    // salidas: undefined - si es que no se encuentra el alimento
    //          foodlocal - alimento 
    async one(id: string, res: Response) {
        const allergen = await this.allergenRepository.findOne({
            where: { id: id }
        })

        if (!allergen) {
            return undefined
        }
        return allergen
    }
    //getAllByIds(ids:any)
    // entradas: ids: Array con id de alimentos que se quieren encontrar
    // salidas: undefined - si es que no se encuentran alimentos
    //          allergens - Array de alimentos
    async getAllbyIds(userRejectsRows: any, res: Response){
        let idList = []
        for (var row of userRejectsRows){
            idList.push(row.allergenId)
        }
        const allergens = await this.allergenRepository.find({where: {id: In(idList)}})
        if (!allergens){
            return undefined
        }
        return allergens
    }
    //saveLocal(food:any)
    // entradas: food: objeto con la forma de Allergen que se quiere agregar al repositorio
    // salidas: undefined - si es que no se puede agregar food al repositorio
    //          createdAllergen - registro agregado al repositorio
    async save(allergen: any, res: Response) {

       const createdAllergen = await this.allergenRepository.save(allergen) // si food.id ya existe en la tabla, save actualiza
       if (createdAllergen){                                             // el registro con los otros campos de food 
           return createdAllergen
       }
       return undefined
   }
    //update(id: any, food: any)
    // entradas: id: código de barras del alimento que se quiere actualizar
    //           food: objeto con la forma de Allergen
    // salidas: undefined - si es que no se puede agregar food al repositorio
    //          updatedAllergen - registro actualizad
    // ************* save puede cumplir el mismo rol de esta función ***********************************
    // ***** pero update recibe un objeto Allergen, save recibe un objeto desde OpenFoodFacts *********
    async update(id: any, allergen: any, res: Response) {
        const updatedAllergen = await this.allergenRepository.update(id, allergen)
        if (updatedAllergen){
            return updatedAllergen
        }
        return undefined
        
    }
    // remove(id: string)
    // entradas: id: código de barras del alimento que se quiere eliminar
    // salidas: undefined - si es que no existe el alimento 
    //          removedFood - registro eliminado
    async remove(id: string, res: Response) {
        let allergenToRemove = await this.allergenRepository.findOneBy({ id: id })

        if (!allergenToRemove) {
            return undefined
        }

        const removedAllergen = await this.allergenRepository.remove(allergenToRemove)

        return removedAllergen
    }

}