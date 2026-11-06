import { describe, expect, it } from "vitest";
import type { UserPermissionRepository } from "../../../src/application/auth/ports/user-permission-repository.port.js";
import { GetCurrentUserUseCase } from "../../../src/application/auth/use-cases/get-current-user.use-case.js";
import type { UserRepository } from "../../../src/application/user/ports/user-repository.port.js";
import { aUser } from "../../support/builders.js";
import { stub } from "../../support/stub.js";

function setup(user: ReturnType<typeof aUser> | null) {
  const users = stub<UserRepository>({ findById: async () => user });
  const permissions = stub<UserPermissionRepository>({
    findByUserId: async () => [{ module: "projects", canRead: true, canWrite: true }],
  });

  return new GetCurrentUserUseCase(users, permissions);
}

describe("GetCurrentUserUseCase", () => {
  it("returns the session user with permissions and avatar url", async () => {
    const result = await setup(aUser({ avatarFileId: 5 })).execute(1);

    expect(result).toMatchObject({
      id: 1,
      email: "ada@example.com",
      permissions: [{ module: "projects", canRead: true, canWrite: true }],
      mustChangePassword: false,
    });
    expect(result?.avatarUrl).toContain("/users/1/avatar");
  });

  it("returns no avatar url when the user has no photo", async () => {
    const result = await setup(aUser()).execute(1);

    expect(result?.avatarUrl).toBeNull();
  });

  it("returns null when the user does not exist", async () => {
    await expect(setup(null).execute(1)).resolves.toBeNull();
  });
});
