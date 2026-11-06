import { describe, expect, it } from "vitest";
import type { FileRepository } from "../../../src/application/file/ports/file-repository.port.js";
import type { FileStorage } from "../../../src/application/file/ports/file-storage.port.js";
import type { UserRepository } from "../../../src/application/user/ports/user-repository.port.js";
import { RemoveAvatarUseCase } from "../../../src/application/user/use-cases/remove-avatar.use-case.js";
import { UserNotFoundError } from "../../../src/domain/user/user.errors.js";
import { aUser } from "../../support/builders.js";
import { transactionDouble } from "../../support/doubles.js";
import { stub } from "../../support/stub.js";

function setup(user: ReturnType<typeof aUser> | null) {
  const users = stub<UserRepository>({
    findById: async () => user,
    setAvatar: async () => undefined,
  });
  const files = stub<FileRepository>({
    findById: async () => ({ id: 3, storageKey: "avatars/1/photo.png", mimeType: "image/png" }),
    delete: async () => undefined,
  });
  const storage = stub<FileStorage>({ delete: async () => undefined });

  return {
    users,
    files,
    storage,
    useCase: new RemoveAvatarUseCase(users, files, storage, transactionDouble()),
  };
}

describe("RemoveAvatarUseCase", () => {
  it("clears the photo and deletes its file", async () => {
    const { useCase, users, files, storage } = setup(aUser({ avatarFileId: 3 }));

    await useCase.execute({ actorUserId: 1 });

    expect(users.setAvatar).toHaveBeenCalledWith({ id: 1, avatarFileId: null, actorUserId: 1 });
    expect(files.delete).toHaveBeenCalledWith({ id: 3 });
    expect(storage.delete).toHaveBeenCalledWith("avatars/1/photo.png");
  });

  it("does nothing when the user has no photo", async () => {
    const { useCase, users, storage } = setup(aUser());

    await useCase.execute({ actorUserId: 1 });

    expect(users.setAvatar).not.toHaveBeenCalled();
    expect(storage.delete).not.toHaveBeenCalled();
  });

  it("fails when the user does not exist", async () => {
    const { useCase } = setup(null);

    await expect(useCase.execute({ actorUserId: 1 })).rejects.toThrow(UserNotFoundError);
  });
});
