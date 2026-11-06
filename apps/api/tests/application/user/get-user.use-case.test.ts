import { describe, expect, it } from "vitest";
import type { UserPermissionRepository } from "../../../src/application/auth/ports/user-permission-repository.port.js";
import type { UserRepository } from "../../../src/application/user/ports/user-repository.port.js";
import { GetUserUseCase } from "../../../src/application/user/use-cases/get-user.use-case.js";
import { UserNotFoundError } from "../../../src/domain/user/user.errors.js";
import { aUser } from "../../support/builders.js";
import { stub } from "../../support/stub.js";

const permissions = stub<UserPermissionRepository>({
  findByUserId: async () => [{ module: "users", canRead: true, canWrite: false }],
});

describe("GetUserUseCase", () => {
  it("returns the user with their permissions", async () => {
    const users = stub<UserRepository>({ findById: async () => aUser() });

    const result = await new GetUserUseCase(users, permissions).execute({ id: 1 });

    expect(result).toMatchObject({
      id: 1,
      name: "Ada",
      email: "ada@example.com",
      permissions: [{ module: "users", canRead: true, canWrite: false }],
    });
  });

  it("never exposes the password hash", async () => {
    const users = stub<UserRepository>({ findById: async () => aUser() });

    const result = await new GetUserUseCase(users, permissions).execute({ id: 1 });

    expect(JSON.stringify(result)).not.toContain("hash:");
  });

  it("fails when the user does not exist", async () => {
    const users = stub<UserRepository>({ findById: async () => null });

    await expect(
      new GetUserUseCase(users, permissions).execute({ id: 9 }),
    ).rejects.toThrow(UserNotFoundError);
  });
});
