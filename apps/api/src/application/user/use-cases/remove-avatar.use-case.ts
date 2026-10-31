import { UserNotFoundError } from "../../../domain/user/user.errors.js";
import type { FileRepository } from "../../file/ports/file-repository.port.js";
import type { FileStorage } from "../../file/ports/file-storage.port.js";
import type { Actor } from "../../shared/actor.js";
import type { TransactionManager } from "../../shared/ports/transaction-manager.port.js";
import type { UserRepository } from "../ports/user-repository.port.js";

export class RemoveAvatarUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly fileRepository: FileRepository,
    private readonly storage: FileStorage,
    private readonly transaction: TransactionManager,
  ) {}

  async execute({ actorUserId }: Actor): Promise<void> {
    const user = await this.userRepository.findById(actorUserId);

    if (!user) {
      throw new UserNotFoundError(actorUserId);
    }

    const avatarFileId = user.avatarFileId;

    if (avatarFileId === null) {
      return;
    }

    const storageKey = await this.transaction.run(async () => {
      const file = await this.fileRepository.findById({ id: avatarFileId });

      await this.userRepository.setAvatar({
        id: actorUserId,
        avatarFileId: null,
        actorUserId,
      });
      await this.fileRepository.delete({ id: avatarFileId });

      return file?.storageKey ?? null;
    });

    if (storageKey) {
      await this.storage.delete(storageKey).catch(() => undefined);
    }
  }
}
