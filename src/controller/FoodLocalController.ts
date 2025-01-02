import { AppDataSource } from "../data-source"
import { Response } from "express"
import { FoodLocal } from "../entity/FoodLocal"
import { In } from "typeorm"
import { Allergen } from "../entity/Allergen"
import { Additive } from "../entity/Additive"
import { FoodHasAllergen } from "../entity/FoodHasAllergen"
import { FoodHasAdditive } from "../entity/FoodHasAdditive"

export class FoodLocalController {

    private readonly foodLocalRepository = AppDataSource.getRepository(FoodLocal)
    private readonly allergenRepository = AppDataSource.getRepository(Allergen)
    private readonly additiveRepository = AppDataSource.getRepository(Additive)
    private readonly foodHasAllergenRepository = AppDataSource.getRepository(FoodHasAllergen)
    private readonly foodHasAdditiveRepository = AppDataSource.getRepository(FoodHasAdditive)
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
            where: { id: id },
            relations: ["foodHasAdditive", "foodHasAllergen", "foodHasAdditive.additive", "foodHasAllergen.allergen"]
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
    // llamado al leer un mensaje de un topic
    async saveLocal(food: FoodLocal) {
        if (!food){
            return undefined
        }

        // let foodData = JSON.stringify(foodExternal.product)
        const foodLocal = Object.assign(new FoodLocal(), {
            id: food.id,
            name: food.name,
            picture: food.picture,
            foodData: food.foodData,
            hasLocalAllergens: food.hasLocalAllergens,
            hasLocalAdditives: food.hasLocalAdditives
        })
        let newAllergenTags = []
        let newAdditiveTags = []
        let oldAllergenTags = []
        let oldTracesTags = []

        if (food.hasLocalAllergens){
            if (food.foodHasAllergen){
                newAllergenTags = food.foodHasAllergen.map(allergen => allergen)  
            }
            else{
                if (food.foodData.allergens){
                    oldAllergenTags = food.foodData.allergens.split(", ")
                }
                if (food.foodData.traces){
                    oldTracesTags = food.foodData.traces.split(", ")
                }
            }
        }
        else{
            oldAllergenTags = food.foodData.allergens_tags
            oldTracesTags = food.foodData.traces_tags
        }
        if(food.hasLocalAdditives){
            if (food.foodHasAllergen){
                newAdditiveTags = food.foodHasAdditive.map(additive => additive.additiveId)  
            }
            else{
                if (food.foodData.additives_tags){
                    newAdditiveTags = food.foodData.additives_tags
                }
            }
        }
        else{
            newAdditiveTags = food.foodData.additives_tags
        }

        const createdFoodLocal = await this.foodLocalRepository.save(foodLocal)
        if (createdFoodLocal){
            if (food.hasLocalAllergens) {
                await this.foodHasAllergenRepository.delete({
                    foodLocalId: createdFoodLocal.id
                });
                if (newAllergenTags.length>0){
                    for (const allergenUpdate of newAllergenTags) {
                        let allergen = await this.allergenRepository.findOne({ where: { id: allergenUpdate.allergenId } });
                        if (allergen) {
                            let foodHasAllergen = await this.foodHasAllergenRepository.findOne({
                                where: {
                                    foodLocalId: createdFoodLocal.id,
                                    allergenId: allergen.id
                                },
                            });
                
                            if (!foodHasAllergen) {
                                foodHasAllergen = this.foodHasAllergenRepository.create({
                                    foodLocal: createdFoodLocal,
                                    allergen,
                                });
                            }
                
                            // Update the boolean fields
                            foodHasAllergen.isAllergen = allergenUpdate.isAllergen ?? foodHasAllergen.isAllergen;
                            foodHasAllergen.isTrace = allergenUpdate.isTrace ?? foodHasAllergen.isTrace;
                
                            await this.foodHasAllergenRepository.save(foodHasAllergen);
                        }
                    }
                }
                else if (oldAllergenTags.length>0 || oldTracesTags.length>0){
                    let allAllergens = [...oldAllergenTags, ...oldTracesTags]
                    await this.foodHasAllergenRepository.delete({
                        foodLocal: createdFoodLocal,
                    });
                    for (const allergenId of allAllergens) {
                        let allergen = await this.allergenRepository.findOne({ where: { id: allergenId } });
                        if (allergen) {
                            const foodHasAllergen = this.foodHasAllergenRepository.create({
                                foodLocal: createdFoodLocal,
                                allergen,
                                isAllergen: oldAllergenTags.includes(allergen.id),
                                isTrace: oldTracesTags.includes(allergen.id)
                            });
                            await this.foodHasAllergenRepository.save(foodHasAllergen);
                        }
                    }
                }
                
            }
            else{
                let allAllergens = [...oldAllergenTags, ...oldTracesTags]
                await this.foodHasAllergenRepository.delete({
                    foodLocal: createdFoodLocal,
                });
                for (const allergenId of allAllergens) {
                    let allergen = await this.allergenRepository.findOne({ where: { id: allergenId } });
                    if (allergen) {
                        const foodHasAllergen = this.foodHasAllergenRepository.create({
                            foodLocal: createdFoodLocal,
                            allergen,
                            isAllergen: oldAllergenTags.includes(allergen.id),
                            isTrace: oldTracesTags.includes(allergen.id)
                        });
                        await this.foodHasAllergenRepository.save(foodHasAllergen);
                    }               
                }
            }
            await this.foodHasAdditiveRepository.delete({
                foodLocal: createdFoodLocal,
            });
            for (const additiveId of newAdditiveTags) {
                let additive = await this.additiveRepository.findOne({ where: { id: additiveId } });
                if (!additive) {
                    additive = this.additiveRepository.create({ id: additiveId });
                    await this.additiveRepository.save(additive);
                }
                const foodHasAdditive = this.foodHasAdditiveRepository.create({
                    foodLocal: createdFoodLocal,
                    additive,
                });
                await this.foodHasAdditiveRepository.save(foodHasAdditive);
            }
            
        }
        return this.foodLocalRepository.findOne({where: {id: createdFoodLocal.id}, relations: ["foodHasAdditive", "foodHasAllergen", "foodHasAdditive.additive", "foodHasAllergen.allergen"] })
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

    async save(foodExternal: any) {
        if (!foodExternal){
            return undefined
        }
        type foodValues = {
            id: string
            product_name: string
            brands: string
            quantity: string
            allergens: string
            traces: string
            additives: string
            allergens_tags:string[]
            traces_tags:string[]
            additives_tags:string[]
            selected_images: {
                front: {
                    display: {
                        en?:string,
                        es?:string,
                        fr?:string
                    }
                },
                ingredients: {
                    display: {
                        en?:string,
                        es?:string,
                        fr?:string
                    }
                },
                nutrition: {
                    display: {
                        en?:string,
                        es?:string,
                        fr?:string
                    }
                },
                packaging: {
                    display: {
                        en?:string,
                        es?:string,
                        fr?:string
                    }
                }
            }
        }

        const newFood = foodExternal.product as foodValues
        let fullname = newFood.product_name
        
        if(newFood.brands){
            fullname = fullname + " - " + newFood.brands.split(",")[0]
        }
        if (newFood.quantity){
            fullname = fullname + " - " + newFood.quantity
        }

        

        // let foodData = JSON.stringify(foodExternal.product)
        let foodData = foodExternal.product
        const foodLocal = Object.assign(new FoodLocal(), {
            hasLocalAllergens: foodExternal.hasLocalAllergens,
            hasLocalAdditives: foodExternal.hasLocalAdditives,
            id: newFood.id,
            name: fullname,
            picture: newFood.selected_images?.front?.display.en || newFood.selected_images?.front?.display.es || newFood.selected_images?.front?.display.fr || undefined,
            foodData: foodData
        })

        const createdFoodLocal = await this.foodLocalRepository.save(foodLocal)

        console.log("FOOOOOOOD", createdFoodLocal)

        let newAllergenTags = []
        let newAdditiveTags = []
        let oldAllergenTags = []
        let oldTracesTags = []

        if (foodExternal.hasLocalAllergens){
            if (foodExternal.foodHasAllergen){
                newAllergenTags = foodExternal.foodHasAllergen.map(allergen => allergen)
            }
            else{
                if (foodData.allergens){
                    oldAllergenTags = foodData.allergens.split(", ")
                }
                if (foodData.traces){
                    oldTracesTags = foodData.traces.split(", ")
                }
            }
        }
        else{
            oldAllergenTags = foodData.allergens_tags
            oldTracesTags = foodData.traces_tags
        }
        console.log("NEWALLERGNES: ", newAllergenTags)
        if(foodExternal.hasLocalAdditives){
            if (foodExternal.foodHasAdditive){
                newAdditiveTags = foodExternal.foodHasAdditive.map(additive => additive.additiveId)
            }
            else{
                if (foodData.additives_tags){
                    console.log("ALTADDITIVES")
                    newAdditiveTags = foodData.additives_tags
                }
            }
        }
        else{
            newAdditiveTags = foodData.additives_tags
        }
        console.log("NEWAdDDITIVES: ", newAdditiveTags)

        if (createdFoodLocal){
            await this.foodHasAllergenRepository.delete({
                foodLocalId: createdFoodLocal.id
            });
            if (foodExternal.hasLocalAllergens) {
                await this.foodHasAllergenRepository.delete({
                    foodLocalId: createdFoodLocal.id
                });
                if (newAllergenTags.length>0){
                    for (const allergenUpdate of newAllergenTags) {
                        let allergen = await this.allergenRepository.findOne({ where: { id: allergenUpdate.allergenId } });
                        if (allergen) {
                            let foodHasAllergen = await this.foodHasAllergenRepository.findOne({
                                where: {
                                    foodLocalId: createdFoodLocal.id,
                                    allergenId: allergen.id
                                },
                            });
                
                            if (!foodHasAllergen) {
                                foodHasAllergen = this.foodHasAllergenRepository.create({
                                    foodLocal: createdFoodLocal,
                                    allergen,
                                });
                            }
                
                            // Update the boolean fields
                            foodHasAllergen.isAllergen = allergenUpdate.isAllergen ?? foodHasAllergen.isAllergen;
                            foodHasAllergen.isTrace = allergenUpdate.isTrace ?? foodHasAllergen.isTrace;
                
                            await this.foodHasAllergenRepository.save(foodHasAllergen);
                        }
                    }
                }
                else if (oldAllergenTags.length>0 || oldTracesTags.length>0){
                    let allAllergens = [...oldAllergenTags, ...oldTracesTags]
                    await this.foodHasAllergenRepository.delete({
                        foodLocal: createdFoodLocal,
                    });
                    for (const allergenId of allAllergens) {
                        let allergen = await this.allergenRepository.findOne({ where: { id: allergenId } });
                        if (allergen) {
                            const foodHasAllergen = this.foodHasAllergenRepository.create({
                                foodLocal: createdFoodLocal,
                                allergen,
                                isAllergen: oldAllergenTags.includes(allergen.id),
                                isTrace: oldTracesTags.includes(allergen.id)
                            });
                            await this.foodHasAllergenRepository.save(foodHasAllergen);
                        }
                    }
                }
                
            }
            else{
                let allAllergens = [...oldAllergenTags, ...oldTracesTags]
                await this.foodHasAllergenRepository.delete({
                    foodLocal: createdFoodLocal,
                });
                for (const allergenId of allAllergens) {
                    let allergen = await this.allergenRepository.findOne({ where: { id: allergenId } });
                    if (allergen) {
                        const foodHasAllergen = this.foodHasAllergenRepository.create({
                            foodLocal: createdFoodLocal,
                            allergen,
                            isAllergen: oldAllergenTags.includes(allergen.id),
                            isTrace: oldTracesTags.includes(allergen.id)
                        });
                        await this.foodHasAllergenRepository.save(foodHasAllergen);
                    }
                }
            }
            await this.foodHasAdditiveRepository.delete({
                foodLocal: createdFoodLocal,
            });
            for (const additiveId of newAdditiveTags) {
                let additive = await this.additiveRepository.findOne({ where: { id: additiveId } });
                if (!additive) {
                    additive = this.additiveRepository.create({ id: additiveId });
                    await this.additiveRepository.save(additive);
                }
                const foodHasAdditive = this.foodHasAdditiveRepository.create({
                    foodLocal: createdFoodLocal,
                    additive,
                });
                await this.foodHasAdditiveRepository.save(foodHasAdditive);
            }
            return createdFoodLocal
        }
        return undefined
    }

}