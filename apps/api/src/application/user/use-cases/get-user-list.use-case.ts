import { UserDto } from "@orbit/shared";
import { UserRepository } from "../ports/user-repository.port.js";
import { buildAvatarUrl } from "../utils/avatar-url.js";

export class GetUserListUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<UserDto[]> {
    const users = await this.userRepository.findAll();

    return users.map((user) => {
      return {
        id: user.id!,
        name: user.name,
        lastName: user.lastName,
        email: user.email.toString(),
        avatarUrl: buildAvatarUrl(user.id!, user.avatarFileId),
      };
    });
  }
}
