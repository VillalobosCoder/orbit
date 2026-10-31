import type { UserIdRequestDto } from "@orbit/shared";
import {
  AvatarNotFoundError,
  UserNotFoundError,
} from "../../../domain/user/user.errors.js";
import type {
  FileContent,
  FileRepository,
} from "../../file/ports/file-repository.port.js";
import type { FileStorage } from "../../file/ports/file-storage.port.js";
import type { UserRepository } from "../ports/user-repository.port.js";

export class GetAvatarUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly fileRepository: FileRepository,
    private readonly storage: FileStorage,
  ) {}

  async execute({ id }: UserIdRequestDto): Promise<FileContent> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new UserNotFoundError(id);
    }

    if (user.avatarFileId === null) {
      throw new AvatarNotFoundError();
    }

    const file = await this.fileRepository.findById({
      id: user.avatarFileId,
    });
    const content = file ? await this.storage.read(file.storageKey) : null;

    if (!file || !content) {
      throw new AvatarNotFoundError();
    }

    return { content, mimeType: file.mimeType };
  }
}
