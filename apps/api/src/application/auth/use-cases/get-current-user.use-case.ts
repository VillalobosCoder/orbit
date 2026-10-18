import type { AuthenticatedUserDto } from "@orbit/shared";
import type { UserRepository } from "../../user/ports/user-repository.port.js";

export class GetCurrentUserUseCase {
  constructor(private readonly usersRepository: UserRepository) {}

  async execute(id: number): Promise<AuthenticatedUserDto | null> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      return null;
    }

    return {
      id,
      name: user.name,
      email: user.email.toString(),
    };
  }
}
