import { describe, expect, it } from "vitest";
import type { UserRepository } from "../../../src/application/user/ports/user-repository.port.js";
import { DeleteUserUseCase } from "../../../src/application/user/use-cases/delete-user.use-case.js";
import { UserNotFoundError } from "../../../src/domain/user/user.errors.js";
import { aUser } from "../../support/builders.js";
import { stub } from "../../support/stub.js";

describe("DeleteUserUseCase", () => {
  it("deletes an existing user", async () => {
    const users = stub<UserRepository>({
      findById: async () => aUser(),
      delete: async () => undefined,
    });

    await new DeleteUserUseCase(users).execute({ id: 1 });

    expect(users.delete).toHaveBeenCalledWith(1);
  });

  it("fails when the user does not exist", async () => {
    const users = stub<UserRepository>({ findById: async () => null });

    await expect(new DeleteUserUseCase(users).execute({ id: 9 })).rejects.toThrow(
      UserNotFoundError,
    );
    expect(users.delete).not.toHaveBeenCalled();
  });
});
