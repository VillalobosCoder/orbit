import { describe, expect, it } from "vitest";
import type { UserRepository } from "../../../src/application/user/ports/user-repository.port.js";
import { BootstrapInitialAdminUseCase } from "../../../src/application/user/use-cases/bootstrap-initial-admin.use-case.js";
import { InitialAdminAlreadyExistsError, PasswordTooLongError } from "../../../src/domain/user/user.errors.js";
import { hasherDouble, transactionDouble } from "../../support/doubles.js";
import { stub } from "../../support/stub.js";

const input = {
  name: "Admin",
  lastName: "Orbit",
  email: "Admin@Example.com",
  password: "Admin-Password-1",
};

describe("BootstrapInitialAdminUseCase", () => {
  it("creates the first administrator with a hashed password", async () => {
    const users = stub<UserRepository>({ bootstrapInitialAdmin: async () => undefined });

    await new BootstrapInitialAdminUseCase(
      users,
      hasherDouble(),
      transactionDouble(),
    ).execute(input);

    const [saved] = users.bootstrapInitialAdmin.mock.calls[0]!;
    expect(saved.email.toString()).toBe("admin@example.com");
    expect(saved.password).toBe("hash:Admin-Password-1");
    expect(saved.mustChangePassword).toBe(false);
  });

  it("refuses to run when a user already exists", async () => {
    const users = stub<UserRepository>({
      bootstrapInitialAdmin: async () => {
        throw new InitialAdminAlreadyExistsError();
      },
    });

    await expect(
      new BootstrapInitialAdminUseCase(users, hasherDouble(), transactionDouble()).execute(input),
    ).rejects.toThrow(InitialAdminAlreadyExistsError);
  });

  it("rejects an oversized password before hashing it", async () => {
    const users = stub<UserRepository>({});
    const hasher = hasherDouble();

    await expect(
      new BootstrapInitialAdminUseCase(users, hasher, transactionDouble()).execute({
        ...input,
        password: "a".repeat(2000),
      }),
    ).rejects.toThrow(PasswordTooLongError);
    expect(hasher.hash).not.toHaveBeenCalled();
  });
});
