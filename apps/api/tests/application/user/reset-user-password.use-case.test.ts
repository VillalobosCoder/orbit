import { describe, expect, it } from "vitest";
import type { SessionRepository } from "../../../src/application/auth/ports/session-repository.port.js";
import type { UserRepository } from "../../../src/application/user/ports/user-repository.port.js";
import { ResetUserPasswordUseCase } from "../../../src/application/user/use-cases/reset-user-password.use-case.js";
import {
  CannotResetOwnPasswordError,
  UserNotFoundError,
} from "../../../src/domain/user/user.errors.js";
import { Password } from "../../../src/domain/user/value-objects/password.vo.js";
import { aUser } from "../../support/builders.js";
import { hasherDouble } from "../../support/doubles.js";
import { stub } from "../../support/stub.js";

function setup(user: ReturnType<typeof aUser> | null = aUser({ id: 5 })) {
  const users = stub<UserRepository>({
    findById: async () => user,
    setPassword: async () => undefined,
  });
  const sessions = stub<SessionRepository>({
    revokeAllForUser: async () => undefined,
  });

  return {
    users,
    sessions,
    useCase: new ResetUserPasswordUseCase(users, hasherDouble(), sessions),
  };
}

describe("ResetUserPasswordUseCase", () => {
  it("sets a temporary password that must be changed at the next login", async () => {
    const { useCase, users } = setup();

    const result = await useCase.execute({ id: 5, actorUserId: 1 });

    expect(() => Password.create(result.temporaryPassword)).not.toThrow();
    expect(users.setPassword).toHaveBeenCalledWith({
      id: 5,
      passwordHash: `hash:${result.temporaryPassword}`,
      mustChangePassword: true,
      actorUserId: 1,
    });
  });

  it("revokes every session the user had", async () => {
    const { useCase, sessions } = setup();

    await useCase.execute({ id: 5, actorUserId: 1 });

    expect(sessions.revokeAllForUser).toHaveBeenCalledWith(5);
  });

  it("does not let an administrator reset their own password", async () => {
    const { useCase, users } = setup();

    await expect(useCase.execute({ id: 1, actorUserId: 1 })).rejects.toThrow(
      CannotResetOwnPasswordError,
    );
    expect(users.setPassword).not.toHaveBeenCalled();
  });

  it("fails when the user does not exist", async () => {
    const { useCase } = setup(null);

    await expect(useCase.execute({ id: 5, actorUserId: 1 })).rejects.toThrow(
      UserNotFoundError,
    );
  });
});
