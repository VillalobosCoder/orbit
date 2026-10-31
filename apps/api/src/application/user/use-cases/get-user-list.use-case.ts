import type { UserListQueryDto, UserListResponseDto } from "@orbit/shared";
import { UserRepository } from "../ports/user-repository.port.js";
import { buildAvatarUrl } from "../utils/avatar-url.js";

export class GetUserListUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: UserListQueryDto): Promise<UserListResponseDto> {
    const { users, total, page } = await this.userRepository.findPage(query);

    return {
      items: users.map((user) => ({
        id: user.id!,
        name: user.name,
        lastName: user.lastName,
        email: user.email.toString(),
        avatarUrl: buildAvatarUrl(user.id!, user.avatarFileId),
      })),
      total,
      page,
      pageSize: query.pageSize,
    };
  }
}
