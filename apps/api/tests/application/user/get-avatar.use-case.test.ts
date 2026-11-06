import { describe, expect, it } from "vitest";
import type { FileRepository } from "../../../src/application/file/ports/file-repository.port.js";
import type { FileStorage } from "../../../src/application/file/ports/file-storage.port.js";
import type { UserRepository } from "../../../src/application/user/ports/user-repository.port.js";
import { GetAvatarUseCase } from "../../../src/application/user/use-cases/get-avatar.use-case.js";
import {
  AvatarNotFoundError,
  UserNotFoundError,
} from "../../../src/domain/user/user.errors.js";
import { aUser } from "../../support/builders.js";
import { stub } from "../../support/stub.js";

function setup({
  user = aUser({ avatarFileId: 3 }),
  file = { id: 3, storageKey: "avatars/1/p.png", mimeType: "image/png" },
  content = Buffer.from("png"),
}: {
  user?: ReturnType<typeof aUser> | null;
  file?: { id: number; storageKey: string; mimeType: string } | null;
  content?: Buffer | null;
} = {}) {
  const users = stub<UserRepository>({ findById: async () => user });
  const files = stub<FileRepository>({ findById: async () => file });
  const storage = stub<FileStorage>({ read: async () => content });

  return new GetAvatarUseCase(users, files, storage);
}

describe("GetAvatarUseCase", () => {
  it("returns the stored image with its type", async () => {
    const result = await setup().execute({ id: 1 });

    expect(result.mimeType).toBe("image/png");
    expect(result.content.toString()).toBe("png");
  });

  it("fails when the user does not exist", async () => {
    await expect(setup({ user: null }).execute({ id: 1 })).rejects.toThrow(UserNotFoundError);
  });

  it("fails when the user has no photo", async () => {
    await expect(setup({ user: aUser() }).execute({ id: 1 })).rejects.toThrow(
      AvatarNotFoundError,
    );
  });

  it("fails when the file row exists but the content is gone", async () => {
    await expect(setup({ content: null }).execute({ id: 1 })).rejects.toThrow(
      AvatarNotFoundError,
    );
  });
});
