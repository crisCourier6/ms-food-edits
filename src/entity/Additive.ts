import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm"
import { FoodHasAdditive } from "./FoodHasAdditive"

@Entity()
export class Additive {

    @PrimaryColumn({unique: true})
    id: string

    @Column({nullable:true})
    name: string

    @Column({nullable:true})
    altNames: string

    @Column({nullable:true})
    description: string

    @Column({nullable:true})
    toxicity: string

    @Column({nullable:true})
    sources: string

    @Column({nullable: true})
    vegan: boolean

    @Column({nullable: true})
    vegetarian: boolean

    @Column({nullable:true})
    wikidata: string

    @OneToMany(()=>FoodHasAdditive, foodHasAdditive => foodHasAdditive.additive, {onDelete: "CASCADE"})
    foodHasAdditive: FoodHasAdditive[]
}
