import { describe, expect, it } from "vitest";
import type { FileRepository } from "../../../src/application/file/ports/file-repository.port.js";
import type { FileStorage } from "../../../src/application/file/ports/file-storage.port.js";
import type { UserRepository } from "../../../src/application/user/ports/user-repository.port.js";
import { UploadAvatarUseCase } from "../../../src/application/user/use-cases/upload-avatar.use-case.js";
import {
  AvatarTooLargeError,
  InvalidAvatarImageError,
  UserNotFoundError,
} from "../../../src/domain/user/user.errors.js";
import { aUser } from "../../support/builders.js";
import { transactionDouble } from "../../support/doubles.js";
import { bytes, MP4_HEADER, PNG_HEADER } from "../../support/media.js";
import { stub } from "../../support/stub.js";

function setup(user: ReturnType<typeof aUser> | null = aUser()) {
  const users = stub<UserRepository>({
    findById: async () => user,
    setAvatar: async () => undefined,
  });
  const files = stub<FileRepository>({
    create: async () => 77,
    findById: async () => ({ id: 3, storageKey: "avatars/1/old.png", mimeType: "image/png" }),
    delete: async () => undefined,
  });
  const storage = stub<FileStorage>({
    save: async () => undefined,
    delete: async () => undefined,
  });

  return {
    users,
    files,
    storage,
    useCase: new UploadAvatarUseCase(users, files, storage, transactionDouble()),
  };
}

describe("UploadAvatarUseCase", () => {
  it("stores the image and points the user to it", async () => {
    const { useCase, users, files, storage } = setup();

    await useCase.execute({ actorUserId: 1, content: bytes(PNG_HEADER) });

    expect(storage.save).toHaveBeenCalledTimes(1);
    expect(files.create).toHaveBeenCalledWith(
      expect.objectContaining({ bucket: "avatars", mimeType: "image/png", actorUserId: 1 }),
    );
    expect(users.setAvatar).toHaveBeenCalledWith({
      id: 1,
      avatarFileId: 77,
      actorUserId: 1,
    });
  });

  it("removes the previous photo from the database and from storage", async () => {
    const { useCase, files, storage } = setup(aUser({ avatarFileId: 3 }));

    await useCase.execute({ actorUserId: 1, content: bytes(PNG_HEADER) });

    expect(files.delete).toHaveBeenCalledWith({ id: 3 });
    expect(storage.delete).toHaveBeenCalledWith("avatars/1/old.png");
  });

  it("rejects content that is not a supported image, whatever the client says", async () => {
    const { useCase, storage } = setup();

    await expect(
      useCase.execute({ actorUserId: 1, content: bytes(MP4_HEADER) }),
    ).rejects.toThrow(InvalidAvatarImageError);
    expect(storage.save).not.toHaveBeenCalled();
  });

  it("rejects an image over 2 MB", async () => {
    const { useCase } = setup();

    await expect(
      useCase.execute({ actorUserId: 1, content: bytes(PNG_HEADER, 2 * 1024 * 1024 + 1) }),
    ).rejects.toThrow(AvatarTooLargeError);
  });

  it("fails when the user does not exist", async () => {
    const { useCase } = setup(null);

    await expect(
      useCase.execute({ actorUserId: 1, content: bytes(PNG_HEADER) }),
    ).rejects.toThrow(UserNotFoundError);
  });

  it("deletes the stored file again when the database write fails", async () => {
    const { useCase, files, storage } = setup();
    files.create.mockRejectedValue(new Error("database down"));

    await expect(
      useCase.execute({ actorUserId: 1, content: bytes(PNG_HEADER) }),
    ).rejects.toThrow("database down");

    expect(storage.delete).toHaveBeenCalledTimes(1);
  });
});
