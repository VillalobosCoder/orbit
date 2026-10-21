import { User } from "../../../domain/user/user.entity.js";
import {
  PasswordTooLongError,
  UserAlreadyExistsError,
  WeakPasswordError,
} from "../../../domain/user/user.errors.js";
import { exceedsPasswordByteLimit } from "../../../domain/user/password-policy.js";
import { PasswordHasher } from "../ports/password-hasher.port.js";
import { UserRepository } from "../ports/user-repository.port.js";

export type CreateUserInput = {
  name: string;
  lastName: string;
  email: string;
};

export type CreateUserOutput = {
  temporaryPassword: string;
};

const TEMPORARY_USER_PASSWORD = "12345678";

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hasher: PasswordHasher,
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
    const user = User.register({ ...input, password: passwordHasher });

    await this.userRepository.save(user);

    return { temporaryPassword: password };
  }
}
