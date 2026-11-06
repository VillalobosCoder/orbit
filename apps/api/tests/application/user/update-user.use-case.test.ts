import { describe, expect, it } from "vitest";
import type { UserPermissionRepository } from "../../../src/application/auth/ports/user-permission-repository.port.js";
import type { UserRepository } from "../../../src/application/user/ports/user-repository.port.js";
import { UpdateUserUseCase } from "../../../src/application/user/use-cases/update-user.use-case.js";
import { UserNotFoundError } from "../../../src/domain/user/user.errors.js";
import { aUser } from "../../support/builders.js";
import { transactionDouble } from "../../support/doubles.js";
import { stub } from "../../support/stub.js";

function setup(user: ReturnType<typeof aUser> | null = aUser()) {
  const users = stub<UserRepository>({
    findById: async () => user,
    update: async () => undefined,
  });
  const permissions = stub<UserPermissionRepository>({
    replaceForUser: async () => undefined,
  });

  return {
    users,
    permissions,
    useCase: new UpdateUserUseCase(users, permissions, transactionDouble()),
  };
}

const input = {
  id: 1,
  name: "Ada",
  lastName: "Byron",
  email: "ada.byron@example.com",
  actorUserId: 2,
};

describe("UpdateUserUseCase", () => {
  it("updates the profile and records who did it", async () => {
    const { useCase, users } = setup();

    await useCase.execute(input);

    const [saved, actor] = users.update.mock.calls[0]!;
    expect(saved).toMatchObject({ lastName: "Byron" });
    expect(saved.email.toString()).toBe("ada.byron@example.com");
    expect(actor).toBe(2);
  });

  it("replaces the permissions when they are sent", async () => {
    const { useCase, permissions } = setup();
    const sent = [{ module: "home", canRead: true, canWrite: true }];

    await useCase.execute({ ...input, permissions: sent });

    expect(permissions.replaceForUser).toHaveBeenCalledWith(1, sent, 2);
  });

  it("leaves the permissions alone when none are sent", async () => {
    const { useCase, permissions } = setup();

    await useCase.execute(input);

    expect(permissions.replaceForUser).not.toHaveBeenCalled();
  });

  it("fails when the user does not exist", async () => {
    const { useCase, users } = setup(null);

    await expect(useCase.execute(input)).rejects.toThrow(UserNotFoundError);
    expect(users.update).not.toHaveBeenCalled();
  });
});
