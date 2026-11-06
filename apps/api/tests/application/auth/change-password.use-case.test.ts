import { describe, expect, it } from "vitest";
import { ChangePasswordUseCase } from "../../../src/application/auth/use-cases/change-password.use-case.js";
import type { SessionRepository } from "../../../src/application/auth/ports/session-repository.port.js";
import type { UserRepository } from "../../../src/application/user/ports/user-repository.port.js";
import {
  IncorrectCurrentPasswordError,
  PasswordPolicyError,
  PasswordTooLongError,
  SamePasswordError,
  UserNotFoundError,
} from "../../../src/domain/user/user.errors.js";
import { aUser } from "../../support/builders.js";
import { hasherDouble, tokensDouble } from "../../support/doubles.js";
import { stub } from "../../support/stub.js";

function setup(user: ReturnType<typeof aUser> | null = aUser()) {
  const users = stub<UserRepository>({
    findById: async () => user,
    setPassword: async () => undefined,
  });
  const sessions = stub<SessionRepository>({
    revokeAllForUser: async () => undefined,
  });
  const tokens = tokensDouble();

  return {
    users,
    sessions,
    tokens,
    useCase: new ChangePasswordUseCase(users, hasherDouble(), tokens, sessions),
  };
}

const input = {
  userId: 1,
  currentPassword: "Secret123",
  newPassword: "Another456",
};

describe("ChangePasswordUseCase", () => {
  it("stores the new hash, clears the pending change and returns a fresh token", async () => {
    const { useCase, users, tokens } = setup();

    const result = await useCase.execute(input);

    expect(users.setPassword).toHaveBeenCalledWith({
      id: 1,
      passwordHash: "hash:Another456",
      mustChangePassword: false,
      actorUserId: 1,
    });
    expect(tokens.sign).toHaveBeenCalledWith({ sub: "1" });
    expect(result.token).toBe("token-for-1");
  });

  it("revokes every older session of the user", async () => {
    const { useCase, sessions } = setup();

    await useCase.execute(input);

    expect(sessions.revokeAllForUser).toHaveBeenCalledWith(1);
  });

  it("fails when the user no longer exists", async () => {
    const { useCase } = setup(null);

    await expect(useCase.execute(input)).rejects.toThrow(UserNotFoundError);
  });

  it("rejects a wrong current password and revokes nothing", async () => {
    const { useCase, sessions, users } = setup();

    await expect(
      useCase.execute({ ...input, currentPassword: "Nope12345" }),
    ).rejects.toThrow(IncorrectCurrentPasswordError);

    expect(users.setPassword).not.toHaveBeenCalled();
    expect(sessions.revokeAllForUser).not.toHaveBeenCalled();
  });

  it("rejects a new password equal to the current one", async () => {
    const { useCase } = setup();

    await expect(
      useCase.execute({ ...input, newPassword: "Secret123" }),
    ).rejects.toThrow(SamePasswordError);
  });

  it("rejects a new password that breaks the policy", async () => {
    const { useCase } = setup();

    await expect(
      useCase.execute({ ...input, newPassword: "short" }),
    ).rejects.toThrow(PasswordPolicyError);
  });

  it("rejects an oversized current password before reading the user", async () => {
    const { useCase, users } = setup();

    await expect(
      useCase.execute({ ...input, currentPassword: "a".repeat(2000) }),
    ).rejects.toThrow(PasswordTooLongError);

    expect(users.findById).not.toHaveBeenCalled();
  });
});
