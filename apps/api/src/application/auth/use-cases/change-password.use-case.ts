import type { ChangePasswordRequestDto } from "@orbit/shared";
import {
  IncorrectCurrentPasswordError,
  PasswordTooLongError,
  SamePasswordError,
  UserNotFoundError,
} from "../../../domain/user/user.errors.js";
import { Password } from "../../../domain/user/value-objects/password.vo.js";
import type { PasswordHasher } from "../../user/ports/password-hasher.port.js";
import type { UserRepository } from "../../user/ports/user-repository.port.js";
import type { TokenService } from "../ports/token-service.port.js";

export type ChangePasswordInput = ChangePasswordRequestDto & {
  userId: number;
};

export type ChangePasswordOutput = {
  token: string;
};

export class ChangePasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async execute(input: ChangePasswordInput): Promise<ChangePasswordOutput> {
    if (Password.exceedsByteLimit(input.currentPassword)) {
      throw new PasswordTooLongError();
    }

    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new UserNotFoundError(input.userId);
    }

    const currentMatches = await this.hasher.compare(
      input.currentPassword,
      user.password,
    );

    if (!currentMatches) {
      throw new IncorrectCurrentPasswordError();
    }

    const newPassword = Password.create(input.newPassword);

    if (newPassword.equals(input.currentPassword)) {
      throw new SamePasswordError();
    }

    await this.userRepository.setPassword({
      id: input.userId,
      passwordHash: await this.hasher.hash(newPassword.toString()),
      mustChangePassword: false,
      actorUserId: input.userId,
    });

    return { token: this.tokens.sign({ sub: String(input.userId) }) };
  }
}
