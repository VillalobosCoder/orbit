import type { AuthenticatedUserDto } from "@orbit/shared";
import type { UserRepository } from "../../user/ports/user-repository.port.js";
import type { UserPermissionRepository } from "../ports/user-permission-repository.port.js";

export class GetCurrentUserUseCase {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly permissions: UserPermissionRepository,
  ) {}

  async execute(id: number): Promise<AuthenticatedUserDto | null> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      return null;
    }

    return {
      id,
      name: user.name,
      email: user.email.toString(),
      permissions: await this.permissions.findByUserId(id),
    };
  }
}
