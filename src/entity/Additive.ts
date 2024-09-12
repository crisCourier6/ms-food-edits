import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm"

@Entity()
export class Additive {

    @PrimaryColumn({unique: true})
    id: string

    @Column({nullable: true})
    name: string

    @Column({nullable:true})
    altNames: string

    @Column({nullable:true})
    description: string

    @Column({nullable:true})
    toxicity: string

    @Column({nullable:true})
    sources: string

    @Column()
    vegan: boolean

    @Column()
    vegetarian: boolean

    @Column({nullable:true})
    wikidata: string
}
