import { User } from "../../../domain/user/user.entity.js";
import { PasswordTooLongError } from "../../../domain/user/user.errors.js";
import { Password } from "../../../domain/user/value-objects/password.vo.js";
import type { PasswordHasher } from "../ports/password-hasher.port.js";
import type { UserRepository } from "../ports/user-repository.port.js";
import type { TransactionManager } from "../../shared/ports/transaction-manager.port.js";

export type BootstrapInitialAdminInput = {
  name: string;
  lastName: string;
  email: string;
  password: string;
};

export class BootstrapInitialAdminUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly transaction: TransactionManager,
  ) {}

  async execute(input: BootstrapInitialAdminInput): Promise<void> {
    if (Password.exceedsByteLimit(input.password)) {
      throw new PasswordTooLongError();
    }

    const passwordHash = await this.hasher.hash(input.password);
    const user = User.register({
      name: input.name,
      lastName: input.lastName,
      email: input.email,
      password: passwordHash,
    });

    await this.transaction.run(() =>
      this.userRepository.bootstrapInitialAdmin(user),
    );
  }
}
