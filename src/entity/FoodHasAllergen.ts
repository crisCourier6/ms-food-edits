import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Unique } from "typeorm"
import { FoodLocal } from "./FoodLocal"
import { Allergen } from "./Allergen"

@Entity()
@Unique(["allergenId", "foodLocalId"])
export class FoodHasAllergen {

    @PrimaryColumn()
    allergenId: string

    @PrimaryColumn()
    foodLocalId: string

    @Column({default: false})
    isAllergen: boolean

    @Column({default: false})
    isTrace: boolean

    @ManyToOne(()=>FoodLocal, foodLocal => foodLocal.foodHasAllergen, {onDelete: "CASCADE"})
    @JoinColumn({name: "foodLocalId"})
    foodLocal: FoodLocal

    @ManyToOne(()=>Allergen, allergen => allergen.foodHasAllergen, {onDelete: "CASCADE"})
    @JoinColumn({name: "allergenId"})
    allergen: Allergen
}