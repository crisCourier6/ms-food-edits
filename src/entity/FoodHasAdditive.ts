import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Unique } from "typeorm"
import { FoodLocal } from "./FoodLocal"
import { Additive } from "./Additive"

@Entity()
@Unique(["additiveId", "foodLocalId"])
export class FoodHasAdditive {

    @PrimaryColumn()
    additiveId: string

    @PrimaryColumn()
    foodLocalId: string

    @ManyToOne(()=>FoodLocal, foodLocal => foodLocal.foodHasAdditive, {onDelete: "CASCADE"})
    @JoinColumn({name: "foodLocalId"})
    foodLocal: FoodLocal

    @ManyToOne(()=>Additive, additive => additive.foodHasAdditive, {onDelete: "CASCADE"})
    @JoinColumn({name: "additiveId"})
    additive: Additive
}