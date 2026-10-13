import { UserNotFoundError } from "../../../domain/user/user.errors.js";
import { UserRepository } from "../ports/user-repository.port.js";

export class DeleteUserUseCase {
    constructor(private readonly userRepository: UserRepository){}

    async execute({id}: {id: number}): Promise<void> {
        const user = await this.userRepository.findById(id);
        
        if(!user) {
            throw new UserNotFoundError(id);
        }

        await this.userRepository.delete(id);
    }
}