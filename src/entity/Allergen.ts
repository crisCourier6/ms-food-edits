import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm"

@Entity()
export class Allergen {

    @PrimaryColumn()
    id: string

    @Column()
    name: string

    @Column({nullable:true})
    description: string

    @Column({nullable: true})
    wikidata: string
}