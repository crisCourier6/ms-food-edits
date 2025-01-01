import { AppDataSource } from "../data-source"
import { User } from "../entity/User"
import "dotenv/config"

export class UserController {

    private readonly userRepository = AppDataSource.getRepository(User)

    async create(req: any) {
        return this.userRepository.save(req)
    }
    async update(req: any) {
        const {id, storeProfile, expertProfile, userHasRole, lostPass, ...user } = req
        if (!id) {
            return "id inválida"
        }
       return this.userRepository.save({id, ...user})
    }
    async remove(id:string) {
        let userToRemove = await this.userRepository.findOne({where: {id: id}})
        if (userToRemove){
            return this.userRepository.remove(userToRemove)
        }
        else{
            return "el usuario no existe"
        }
        
    }

}