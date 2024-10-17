import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm"

@Entity()
export class FoodLocal {

    @PrimaryColumn({unique: true})
    id: string

    @Column()
    name: string

    @Column({default: "defaultFood.png"})
    picture: string

    @Column({type: "jsonb", nullable: true})
    foodData: any
}
