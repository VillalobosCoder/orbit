import { InvalidEmailError } from "../user.errors.js";

export class Email {
  private constructor(private readonly value: string) {}

  static create(raw: string): Email {
    const normalize = raw.trim().toLowerCase();
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!pattern.test(normalize)) {
      throw new InvalidEmailError(raw);
    }

    return new Email(normalize);
  }

  toString(): string {
    return this.value;
  }
}
