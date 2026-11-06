import { describe, expect, it } from "vitest";
import { InvalidEmailError } from "../../../src/domain/user/user.errors.js";
import { User } from "../../../src/domain/user/user.entity.js";
import { Email } from "../../../src/domain/user/value-objects/email.vo.js";
import { aUser } from "../../support/builders.js";

describe("Email", () => {
  it("lowercases and trims", () => {
    expect(Email.create("  Ada@Example.COM ").toString()).toBe("ada@example.com");
  });

  it.each(["", "ada", "ada@", "@example.com", "ada@example", "a da@example.com", "ada@@example.com"])(
    "rejects %j",
    (value) => {
      expect(() => Email.create(value)).toThrow(InvalidEmailError);
    },
  );
});

describe("User", () => {
  it("registers with a normalized profile, no photo and the given password hash", () => {
    const user = User.register({
      name: " Ada ",
      lastName: " Lovelace ",
      email: "ADA@example.com",
      password: "hash",
    });

    expect(user).toMatchObject({ name: "Ada", lastName: "Lovelace", avatarFileId: null, password: "hash" });
    expect(user.email.toString()).toBe("ada@example.com");
    expect(user.mustChangePassword).toBe(false);
  });

  it("can be registered with a pending password change", () => {
    expect(
      User.register({ name: "A", lastName: "B", email: "a@b.co", password: "h", mustChangePassword: true })
        .mustChangePassword,
    ).toBe(true);
  });

  it("updates the profile without touching password or photo", () => {
    const updated = aUser({ avatarFileId: 4 }).withProfile({
      name: " Grace ",
      lastName: "Hopper",
      email: "Grace@Example.com",
    });

    expect(updated).toMatchObject({ name: "Grace", avatarFileId: 4, password: "hash:Secret123" });
    expect(updated.email.toString()).toBe("grace@example.com");
  });

  it("rejects an invalid email on update", () => {
    expect(() => aUser().withProfile({ name: "A", lastName: "B", email: "nope" })).toThrow(InvalidEmailError);
  });

  it("refuses to read the id before it is saved", () => {
    expect(() => User.register({ name: "A", lastName: "B", email: "a@b.co", password: "h" }).persistedId).toThrow();
    expect(aUser().persistedId).toBe(1);
  });
});
