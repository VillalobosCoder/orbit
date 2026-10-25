import type { SaveUserRequestDto } from "@orbit/shared";
import { UserNotFoundError } from "../../../domain/user/user.errors.js";
import type { UserPermissionRepository } from "../../auth/ports/user-permission-repository.port.js";
import type { TransactionManager } from "../../shared/ports/transaction-manager.port.js";
import type { UserRepository } from "../ports/user-repository.port.js";

export type UpdateUserInput = SaveUserRequestDto & {
  id: number;
  updatedByUserId: number;
};

export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly permissions: UserPermissionRepository,
    private readonly transaction: TransactionManager,
  ) {}

  async execute(input: UpdateUserInput): Promise<void> {
    await this.transaction.run(async () => {
      const user = await this.userRepository.findById(input.id);

      if (!user) {
        throw new UserNotFoundError(input.id);
      }

      await this.userRepository.update(
        user.withProfile({
          name: input.name,
          lastName: input.lastName,
          email: input.email,
        }),
        input.updatedByUserId,
      );

      if (input.permissions !== undefined) {
        await this.permissions.replaceForUser(
          input.id,
          input.permissions,
          input.updatedByUserId,
        );
      }
    });
  }
}
