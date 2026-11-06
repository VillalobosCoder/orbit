import { describe, expect, it } from "vitest";
import { LoginUseCase } from "../../../src/application/auth/use-cases/login.use-case.js";
import type { UserPermissionRepository } from "../../../src/application/auth/ports/user-permission-repository.port.js";
import type { UserRepository } from "../../../src/application/user/ports/user-repository.port.js";
import { InvalidCredentialsError } from "../../../src/domain/user/user.errors.js";
import { aUser } from "../../support/builders.js";
import { hasherDouble, tokensDouble } from "../../support/doubles.js";
import { stub } from "../../support/stub.js";

function setup(user = aUser()) {
  const users = stub<UserRepository>({
    findByEmail: async () => user,
    updatePassword: async () => undefined,
  });
  const hasher = hasherDouble();
  const tokens = tokensDouble();
  const permissions = stub<UserPermissionRepository>({
    findByUserId: async () => [{ module: "home", canRead: true, canWrite: false }],
  });

  return {
    users,
    hasher,
    tokens,
    useCase: new LoginUseCase(users, hasher, tokens, permissions),
  };
}

describe("LoginUseCase", () => {
  it("returns a token and the user with their permissions", async () => {
    const { useCase, tokens } = setup();

    const result = await useCase.execute({
      email: "ada@example.com",
      password: "Secret123",
    });

    expect(result.token).toBe("token-for-1");
    expect(result.user).toMatchObject({
      id: 1,
      email: "ada@example.com",
      mustChangePassword: false,
      permissions: [{ module: "home", canRead: true, canWrite: false }],
    });
    expect(tokens.sign).toHaveBeenCalledWith({
      sub: "1",
      mustChangePassword: false,
    });
  });

  it("rejects a wrong password", async () => {
    const { useCase } = setup();

    await expect(
      useCase.execute({ email: "ada@example.com", password: "Wrong1234" }),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it("rejects an unknown email while still spending time hashing", async () => {
    const { useCase, users, hasher } = setup();
    users.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: "nobody@example.com", password: "Secret123" }),
    ).rejects.toThrow(InvalidCredentialsError);

    expect(hasher.hash).toHaveBeenCalledTimes(1);
    expect(hasher.compare).toHaveBeenCalledTimes(1);
  });

  it("computes the dummy hash only once across attempts", async () => {
    const { useCase, users, hasher } = setup();
    users.findByEmail.mockResolvedValue(null);

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await expect(
        useCase.execute({ email: "nobody@example.com", password: "Secret123" }),
      ).rejects.toThrow(InvalidCredentialsError);
    }

    expect(hasher.hash).toHaveBeenCalledTimes(1);
    expect(hasher.compare).toHaveBeenCalledTimes(3);
  });

  it("rejects passwords over the byte limit without touching the database", async () => {
    const { useCase, users } = setup();

    await expect(
      useCase.execute({ email: "ada@example.com", password: "a".repeat(2000) }),
    ).rejects.toThrow(InvalidCredentialsError);

    expect(users.findByEmail).not.toHaveBeenCalled();
  });

  it("upgrades the stored hash when the hasher asks for it", async () => {
    const { useCase, users, hasher } = setup();
    hasher.needsRehash.mockReturnValue(true);

    await useCase.execute({ email: "ada@example.com", password: "Secret123" });

    expect(users.updatePassword).toHaveBeenCalledWith(1, "hash:Secret123");
  });

  it("does not rewrite the hash when it is already current", async () => {
    const { useCase, users } = setup();

    await useCase.execute({ email: "ada@example.com", password: "Secret123" });

    expect(users.updatePassword).not.toHaveBeenCalled();
  });

  it("reports a pending password change", async () => {
    const { useCase } = setup(aUser({ mustChangePassword: true }));

    const result = await useCase.execute({
      email: "ada@example.com",
      password: "Secret123",
    });

    expect(result.user.mustChangePassword).toBe(true);
  });
});
