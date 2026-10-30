import { randomInt } from "node:crypto";
import { PasswordPolicyError, PasswordTooLongError } from "../user.errors.js";

const MAX_BYTES = 1024;
const MIN_LENGTH = 8;

const UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijkmnopqrstuvwxyz";
const DIGITS = "23456789";
const GROUPS = 3;
const GROUP_LENGTH = 4;

function pick(alphabet: string): string {
  return alphabet[randomInt(alphabet.length)]!;
}

export class Password {
  private constructor(private readonly value: string) {}

  static create(raw: string): Password {
    if (Password.exceedsByteLimit(raw)) {
      throw new PasswordTooLongError();
    }

    if (
      raw.length < MIN_LENGTH ||
      !/\p{Lu}/u.test(raw) ||
      !/\d/.test(raw)
    ) {
      throw new PasswordPolicyError();
    }

    return new Password(raw);
  }

  static generateTemporary(): Password {
    const all = UPPERCASE + LOWERCASE + DIGITS;
    const characters = [pick(UPPERCASE), pick(LOWERCASE), pick(DIGITS)];

    while (characters.length < GROUPS * GROUP_LENGTH) {
      characters.push(pick(all));
    }

    for (let index = characters.length - 1; index > 0; index -= 1) {
      const swap = randomInt(index + 1);
      [characters[index], characters[swap]] = [
        characters[swap]!,
        characters[index]!,
      ];
    }

    const groups = Array.from({ length: GROUPS }, (_, group) =>
      characters
        .slice(group * GROUP_LENGTH, (group + 1) * GROUP_LENGTH)
        .join(""),
    );

    return new Password(groups.join("-"));
  }

  static exceedsByteLimit(raw: string): boolean {
    return new TextEncoder().encode(raw).byteLength > MAX_BYTES;
  }

  equals(other: string): boolean {
    return this.value === other;
  }

  toString(): string {
    return this.value;
  }
}
