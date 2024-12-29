import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm"
import { UserEditsFood } from "./UserEditsFood"
import { FoodHasAllergen } from "./FoodHasAllergen"
import { FoodHasAdditive } from "./FoodHasAdditive"

@Entity()
export class FoodLocal {

    @PrimaryColumn({unique: true})
    id: string

    @Column({default: "Sin nombre"})
    name: string

    @Column({default: "defaultFood.png"})
    picture: string

    @Column({type: "jsonb", nullable: true})
    foodData: any

    @Column({default: false})
    hasLocalAllergens: boolean

    @Column({default: false})
    hasLocalAdditives: boolean

    @OneToMany(()=>FoodHasAllergen, foodHasAllergen=>foodHasAllergen.foodLocal)
    foodHasAllergen: FoodHasAllergen[]

    @OneToMany(()=>FoodHasAdditive, foodHasAdditive=>foodHasAdditive.foodLocal)
    foodHasAdditive: FoodHasAdditive[]

    @OneToMany(()=>UserEditsFood, userEditsFood=>userEditsFood.foodLocal)
    userEditsFood: UserEditsFood[]
}
