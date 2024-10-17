import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class UserEditsFood {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    idFood: string

    @Column()
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

}
