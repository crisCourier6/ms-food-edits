import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { UserEditsFood } from "./UserEditsFood"


@Entity()
export class User {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({unique: true})
    email: string

    @Column()
    name: string

    @Column({nullable: true})
    hash: string

    @Column({default: false})
    isActive: boolean

    @Column({default: false})
    isSuspended: boolean

    @Column ({default: false, nullable: true})
    isPending: boolean

    @Column({nullable: true})
    activationToken: string

    @Column({nullable: true})
    activationExpire: Date

    @Column({default: "profile_default.png"})
    profilePic: string

    @Column({nullable: true})
    typeExternal: string

    @Column({nullable: true})
    externalId: string

    @Column({nullable: true})
    lastLogin: Date

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @OneToMany(() => UserEditsFood, userEditsFood => userEditsFood.user)
    userEditsFood: UserEditsFood
}
