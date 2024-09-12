import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { Additive } from "../entity/Additive"
import { In, IsNull, Not } from "typeorm"

export class AdditiveController {

    private additiveRepository = AppDataSource.getRepository(Additive)

    //all()
    // entradas:
    // salidas: Array con todas las filas de la tabla food_local
    async all(res: Response) {
        try {
            // Find all additives where the 'name' column is not null
            const additives = await this.additiveRepository.find({
                where: {
                    name: Not(IsNull()), // Use Not(IsNull()) to filter out null values
                },
            });

            return additives;
        } catch (error) {
            // Handle error (e.g., log it, return an error response)
            console.error('Error fetching additives:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    //one(id: string)
    // entradas: id: id del alimento que se quiere encontrar
    // salidas: undefined - si es que no se encuentra el alimento
    //          foodlocal - alimento 
    async one(id: string, res: Response) {
        const additive = await this.additiveRepository.findOne({
            where: { id: id }
        })

        if (!additive) {
            return undefined
        }
        return additive
    }
    //getAllByIds(ids:any)
    // entradas: ids: Array con id de alimentos que se quieren encontrar
    // salidas: undefined - si es que no se encuentran alimentos
    //          additives - Array de alimentos
    async getAllbyIds(userRejectsRows: any, res: Response){
        let idList = []
        for (var row of userRejectsRows){
            idList.push(row.additiveId)
        }
        const additives = await this.additiveRepository.find({where: {id: In(idList)}})
        if (!additives){
            return undefined
        }
        return additives
    }
    //saveLocal(food:any)
    // entradas: food: objeto con la forma de Additive que se quiere agregar al repositorio
    // salidas: undefined - si es que no se puede agregar food al repositorio
    //          createdAdditive - registro agregado al repositorio
    async save(additive: any, res: Response) {

       const createdAdditive = await this.additiveRepository.save(additive) // si food.id ya existe en la tabla, save actualiza
       if (createdAdditive){                                             // el registro con los otros campos de food 
           return createdAdditive
       }
       return undefined
   }
    //update(id: any, food: any)
    // entradas: id: código de barras del alimento que se quiere actualizar
    //           food: objeto con la forma de Additive
    // salidas: undefined - si es que no se puede agregar food al repositorio
    //          updatedAdditive - registro actualizad
    // ************* save puede cumplir el mismo rol de esta función ***********************************
    // ***** pero update recibe un objeto Additive, save recibe un objeto desde OpenFoodFacts *********
    async update(id: any, additive: any, res: Response) {
        const updatedAdditive = await this.additiveRepository.update(id, additive)
        if (updatedAdditive){
            return updatedAdditive
        }
        return undefined
        
    }
    // remove(id: string)
    // entradas: id: código de barras del alimento que se quiere eliminar
    // salidas: undefined - si es que no existe el alimento 
    //          removedFood - registro eliminado
    async remove(id: string, res: Response) {
        let additiveToRemove = await this.additiveRepository.findOneBy({ id: id })

        if (!additiveToRemove) {
            return undefined
        }

        const removedAdditive = await this.additiveRepository.remove(additiveToRemove)

        return removedAdditive
    }

}