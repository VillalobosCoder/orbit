import type { UpdateProfileRequestDto } from "@orbit/shared";
import { UserNotFoundError } from "../../../domain/user/user.errors.js";
import type { UserRepository } from "../../user/ports/user-repository.port.js";
import type { Actor } from "../../shared/actor.js";

export type UpdateProfileInput = UpdateProfileRequestDto & Actor;

export class UpdateProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: UpdateProfileInput): Promise<void> {
    const user = await this.userRepository.findById(input.actorUserId);

    if (!user) {
      throw new UserNotFoundError(input.actorUserId);
    }

    await this.userRepository.update(
      user.withProfile({
        name: input.name,
        lastName: input.lastName,
        email: user.email.toString(),
      }),
      input.actorUserId,
    );
  }
}
