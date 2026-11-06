import { describe, expect, it } from "vitest";
import {
  PasswordPolicyError,
  PasswordTooLongError,
} from "../../../src/domain/user/user.errors.js";
import { Password } from "../../../src/domain/user/value-objects/password.vo.js";

describe("Password", () => {
  it("accepts a password with 8 characters, an uppercase letter and a digit", () => {
    expect(Password.create("Abcdefg1").toString()).toBe("Abcdefg1");
  });

  it("rejects passwords shorter than 8 characters", () => {
    expect(() => Password.create("Abc1")).toThrow(PasswordPolicyError);
  });

  it("requires an uppercase letter", () => {
    expect(() => Password.create("abcdefg1")).toThrow(PasswordPolicyError);
  });

  it("requires a digit", () => {
    expect(() => Password.create("Abcdefgh")).toThrow(PasswordPolicyError);
  });

  it("rejects passwords over the byte limit", () => {
    expect(() => Password.create(`A1${"a".repeat(1100)}`)).toThrow(
      PasswordTooLongError,
    );
  });

  it("generates temporary passwords that satisfy the policy", () => {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const temporary = Password.generateTemporary().toString();

      expect(() => Password.create(temporary)).not.toThrow();
    }
  });
});
