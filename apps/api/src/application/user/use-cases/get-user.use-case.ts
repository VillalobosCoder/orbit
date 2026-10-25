import type { UserDetailDto } from "@orbit/shared";
import { UserNotFoundError } from "../../../domain/user/user.errors.js";
import type { UserPermissionRepository } from "../../auth/ports/user-permission-repository.port.js";
import type { UserRepository } from "../ports/user-repository.port.js";

export class GetUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly permissions: UserPermissionRepository,
  ) {}

  async execute({ id }: { id: number }): Promise<UserDetailDto> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new UserNotFoundError(id);
    }

    return {
      id,
      name: user.name,
      lastName: user.lastName,
      email: user.email.toString(),
      permissions: await this.permissions.findByUserId(id),
    };
  }
}
