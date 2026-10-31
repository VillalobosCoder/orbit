import { randomUUID } from "node:crypto";
import { UserNotFoundError } from "../../../domain/user/user.errors.js";
import { AvatarImage } from "../../../domain/user/value-objects/avatar-image.vo.js";
import type { FileRepository } from "../../file/ports/file-repository.port.js";
import type { FileStorage } from "../../file/ports/file-storage.port.js";
import type { Actor } from "../../shared/actor.js";
import type { TransactionManager } from "../../shared/ports/transaction-manager.port.js";
import type { UserRepository } from "../ports/user-repository.port.js";

export type UploadAvatarInput = Actor & { content: Buffer };

const AVATAR_BUCKET = "avatars";

export class UploadAvatarUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly fileRepository: FileRepository,
    private readonly storage: FileStorage,
    private readonly transaction: TransactionManager,
  ) {}

  async execute({ actorUserId, content }: UploadAvatarInput): Promise<void> {
    const image = AvatarImage.create(content);
    const user = await this.userRepository.findById(actorUserId);

    if (!user) {
      throw new UserNotFoundError(actorUserId);
    }

    const storageKey = `${AVATAR_BUCKET}/${actorUserId}/${randomUUID()}.${image.extension}`;
    await this.storage.save(storageKey, image.buffer);

    let previousKey: string | null;

    try {
      previousKey = await this.transaction.run(async () => {
        const previousFileId = user.avatarFileId;
        const fileId = await this.fileRepository.create({
          actorUserId,
          bucket: AVATAR_BUCKET,
          storageKey,
          originalName: `avatar.${image.extension}`,
          mimeType: image.mimeType,
          sizeBytes: image.sizeBytes,
          checksumSha256: image.checksumSha256,
        });

        await this.userRepository.setAvatar({
          id: actorUserId,
          avatarFileId: fileId,
          actorUserId,
        });

        if (previousFileId === null) {
          return null;
        }

        const previousFile = await this.fileRepository.findById({ id: previousFileId });
        await this.fileRepository.delete({ id: previousFileId });

        return previousFile?.storageKey ?? null;
      });
    } catch (error) {
      await this.storage.delete(storageKey).catch(() => undefined);
      throw error;
    }

    if (previousKey) {
      await this.storage.delete(previousKey).catch(() => undefined);
    }
  }
}
