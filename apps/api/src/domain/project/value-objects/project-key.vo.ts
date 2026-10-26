import { InvalidProjectKeyError } from "../project.errors.js";

export class ProjectKey {
  private constructor(private readonly value: string) {}

  static create(raw: string): ProjectKey {
    const normalized = raw.trim().toUpperCase();

    if (!/^[A-Z][A-Z0-9]{1,9}$/.test(normalized)) {
      throw new InvalidProjectKeyError(raw);
    }

    return new ProjectKey(normalized);
  }

  toString(): string {
    return this.value;
  }
}
