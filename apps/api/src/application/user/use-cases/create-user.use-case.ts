import { User } from "../../../domain/user/user.entity.js";
import { UserAlreadyExistsError } from "../../../domain/user/user.errors.js";
import { Password } from "../../../domain/user/value-objects/password.vo.js";
import { PasswordHasher } from "../ports/password-hasher.port.js";
import type { SaveUserRequestDto } from "@orbit/shared";
import { UserRepository } from "../ports/user-repository.port.js";
import type { UserPermissionRepository } from "../../auth/ports/user-permission-repository.port.js";
import type { Actor } from "../../shared/actor.js";
import type { TransactionManager } from "../../shared/ports/transaction-manager.port.js";

export type CreateUserInput = SaveUserRequestDto & Actor;

export type CreateUserOutput = {
  temporaryPassword: string;
};

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly permissions: UserPermissionRepository,
    private readonly transaction: TransactionManager,
  ) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    const existing = await this.userRepository.findByEmail(input.email);

    if (existing) {
      throw new UserAlreadyExistsError(input.email);
    }

    const temporaryPassword = Password.generateTemporary();
    const user = User.register({
      name: input.name,
      lastName: input.lastName,
      email: input.email,
      password: await this.hasher.hash(temporaryPassword.toString()),
      mustChangePassword: true,
    });

    await this.transaction.run(async () => {
      const userId = await this.userRepository.save(
        user,
        input.actorUserId,
      );
      await this.permissions.replaceForUser(
        userId,
        input.permissions ?? [],
        input.actorUserId,
      );
    });

    return { temporaryPassword: temporaryPassword.toString() };
  }
}
