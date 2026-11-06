import { describe, expect, it } from "vitest";
import { UpdateProfileUseCase } from "../../../src/application/auth/use-cases/update-profile.use-case.js";
import type { UserRepository } from "../../../src/application/user/ports/user-repository.port.js";
import { UserNotFoundError } from "../../../src/domain/user/user.errors.js";
import { aUser } from "../../support/builders.js";
import { stub } from "../../support/stub.js";

describe("UpdateProfileUseCase", () => {
  it("changes the name but keeps the email", async () => {
    const users = stub<UserRepository>({
      findById: async () => aUser(),
      update: async () => undefined,
    });

    await new UpdateProfileUseCase(users).execute({
      name: "  Grace ",
      lastName: "Hopper",
      actorUserId: 1,
    });

    const [saved, actor] = users.update.mock.calls[0]!;
    expect(saved).toMatchObject({ name: "Grace", lastName: "Hopper" });
    expect(saved.email.toString()).toBe("ada@example.com");
    expect(actor).toBe(1);
  });

  it("fails when the user does not exist", async () => {
    const users = stub<UserRepository>({ findById: async () => null });

    await expect(
      new UpdateProfileUseCase(users).execute({
        name: "Grace",
        lastName: "Hopper",
        actorUserId: 9,
      }),
    ).rejects.toThrow(UserNotFoundError);
  });
});
