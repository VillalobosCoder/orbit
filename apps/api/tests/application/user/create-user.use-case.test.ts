import { describe, expect, it } from "vitest";
import type { UserPermissionRepository } from "../../../src/application/auth/ports/user-permission-repository.port.js";
import type { UserRepository } from "../../../src/application/user/ports/user-repository.port.js";
import { CreateUserUseCase } from "../../../src/application/user/use-cases/create-user.use-case.js";
import {
  InvalidEmailError,
  UserAlreadyExistsError,
} from "../../../src/domain/user/user.errors.js";
import { Password } from "../../../src/domain/user/value-objects/password.vo.js";
import { aUser } from "../../support/builders.js";
import { hasherDouble, transactionDouble } from "../../support/doubles.js";
import { stub } from "../../support/stub.js";

function setup(existing: ReturnType<typeof aUser> | null = null) {
  const users = stub<UserRepository>({
    findByEmail: async () => existing,
    save: async () => 42,
  });
  const permissions = stub<UserPermissionRepository>({
    replaceForUser: async () => undefined,
  });

  return {
    users,
    permissions,
    useCase: new CreateUserUseCase(
      users,
      hasherDouble(),
      permissions,
      transactionDouble(),
    ),
  };
}

const input = {
  name: "Grace",
  lastName: "Hopper",
  email: "Grace@Example.com",
  permissions: [{ module: "home", canRead: true, canWrite: false }],
  actorUserId: 1,
};

describe("CreateUserUseCase", () => {
  it("creates the user with a temporary password that must be changed", async () => {
    const { useCase, users } = setup();

    const result = await useCase.execute(input);

    expect(() => Password.create(result.temporaryPassword)).not.toThrow();
    const [saved, actor] = users.save.mock.calls[0]!;
    expect(saved.email.toString()).toBe("grace@example.com");
    expect(saved.mustChangePassword).toBe(true);
    expect(saved.password).toBe(`hash:${result.temporaryPassword}`);
    expect(actor).toBe(1);
  });

  it("assigns the requested permissions to the new user", async () => {
    const { useCase, permissions } = setup();

    await useCase.execute(input);

    expect(permissions.replaceForUser).toHaveBeenCalledWith(
      42,
      input.permissions,
      1,
    );
  });

  it("creates the user without permissions when none are sent", async () => {
    const { useCase, permissions } = setup();

    await useCase.execute({ ...input, permissions: undefined });

    expect(permissions.replaceForUser).toHaveBeenCalledWith(42, [], 1);
  });

  it("rejects an email that is already registered", async () => {
    const { useCase, users } = setup(aUser());

    await expect(useCase.execute(input)).rejects.toThrow(UserAlreadyExistsError);

    expect(users.save).not.toHaveBeenCalled();
  });

  it("rejects an invalid email", async () => {
    const { useCase } = setup();

    await expect(
      useCase.execute({ ...input, email: "not-an-email" }),
    ).rejects.toThrow(InvalidEmailError);
  });
});
