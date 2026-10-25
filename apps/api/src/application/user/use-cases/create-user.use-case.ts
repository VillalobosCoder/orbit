import { User } from "../../../domain/user/user.entity.js";
import {
  PasswordTooLongError,
  UserAlreadyExistsError,
  WeakPasswordError,
} from "../../../domain/user/user.errors.js";
import { exceedsPasswordByteLimit } from "../../../domain/user/password-policy.js";
import { PasswordHasher } from "../ports/password-hasher.port.js";
import type { SaveUserRequestDto } from "@orbit/shared";
import { UserRepository } from "../ports/user-repository.port.js";
import type { UserPermissionRepository } from "../../auth/ports/user-permission-repository.port.js";
import type { TransactionManager } from "../../shared/ports/transaction-manager.port.js";

export type CreateUserInput = SaveUserRequestDto & {
  createdByUserId: number;
};

export type CreateUserOutput = {
  temporaryPassword: string;
};

const TEMPORARY_USER_PASSWORD = "12345678";

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

    const password = TEMPORARY_USER_PASSWORD;
    if (password.length < 8) {
      throw new WeakPasswordError();
    }

    if (exceedsPasswordByteLimit(password)) {
      throw new PasswordTooLongError();
    }

    const passwordHasher = await this.hasher.hash(password);
    const user = User.register({
      name: input.name,
      lastName: input.lastName,
      email: input.email,
      password: passwordHasher,
    });

    await this.transaction.run(async () => {
      const userId = await this.userRepository.save(
        user,
        input.createdByUserId,
      );
      await this.permissions.replaceForUser(
        userId,
        input.permissions ?? [],
        input.createdByUserId,
      );
    });

    return { temporaryPassword: password };
  }
}
