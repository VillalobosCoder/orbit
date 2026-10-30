import type {
  ResetUserPasswordResponseDto,
  UserIdRequestDto,
} from "@orbit/shared";
import {
  CannotResetOwnPasswordError,
  UserNotFoundError,
} from "../../../domain/user/user.errors.js";
import { Password } from "../../../domain/user/value-objects/password.vo.js";
import type { PasswordHasher } from "../ports/password-hasher.port.js";
import type { UserRepository } from "../ports/user-repository.port.js";
import type { Actor } from "../../shared/actor.js";

export type ResetUserPasswordInput = UserIdRequestDto & Actor;

export class ResetUserPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  async execute(
    input: ResetUserPasswordInput,
  ): Promise<ResetUserPasswordResponseDto> {
    if (input.id === input.actorUserId) {
      throw new CannotResetOwnPasswordError();
    }

    const user = await this.userRepository.findById(input.id);

    if (!user) {
      throw new UserNotFoundError(input.id);
    }

    const temporaryPassword = Password.generateTemporary();

    await this.userRepository.setPassword({
      id: input.id,
      passwordHash: await this.hasher.hash(temporaryPassword.toString()),
      mustChangePassword: true,
      actorUserId: input.actorUserId,
    });

    return { temporaryPassword: temporaryPassword.toString() };
  }
}
