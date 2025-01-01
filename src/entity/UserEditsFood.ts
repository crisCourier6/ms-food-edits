import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { FoodLocal } from "./FoodLocal"
import { User } from "./User"

@Entity()
export class UserEditsFood {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({nullable: true})
    idFood: string

    @Column({nullable: true})
    idUser: string

    @Column({nullable: true})
    idJudge: string
    // type : "new" "edit"
    @Column()
    type: string
    // state: "pending" "rejected" "accepted"
    @Column()
    state: string

    @CreateDateColumn()
    createdAt: Date

    @Column({nullable: true})
    judgedAt: Date

    @Column({nullable: true})
    rejectReason: string

    @Column({nullable:true})
    imagesFolder: string

    @Column({type: "jsonb", nullable:true})
    foodData: any

    @ManyToOne(()=>FoodLocal, foodLocal => foodLocal.userEditsFood, {onDelete: "CASCADE", nullable: true})
    @JoinColumn({name: "idFood"})
    foodLocal?: FoodLocal

    @ManyToOne(()=>User, user => user.userEditsFood, {onDelete: "CASCADE", nullable: true})
    @JoinColumn({name: "idUser"})
    user?: User

}
