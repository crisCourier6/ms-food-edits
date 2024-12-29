import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm"
import { FoodHasAllergen } from "./FoodHasAllergen"

@Entity()
export class Allergen {

    @PrimaryColumn()
    id: string

    @Column({nullable:true})
    name: string

    @Column({nullable:true})
    description: string

    @Column({nullable: true})
    wikidata: string

    @OneToMany(()=>FoodHasAllergen, foodHasAllergen => foodHasAllergen.allergen, {onDelete: "CASCADE"})
    foodHasAllergen: FoodHasAllergen[]
}