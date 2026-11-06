import { describe, expect, it } from "vitest";
import { ScryptPasswordHasher } from "../../../src/infrastructure/security/scrypt-password-hasher.js";

describe("ScryptPasswordHasher", () => {
  const hasher = new ScryptPasswordHasher();

  it("verifies the right password and rejects a wrong one", async () => {
    const hash = await hasher.hash("Correct-Horse-1");

    await expect(hasher.compare("Correct-Horse-1", hash)).resolves.toBe(true);
    await expect(hasher.compare("Correct-Horse-2", hash)).resolves.toBe(false);
  });

  it("never stores the plain password and salts every hash differently", async () => {
    const a = await hasher.hash("Same-Password-1");
    const b = await hasher.hash("Same-Password-1");

    expect(a).not.toContain("Same-Password-1");
    expect(a).not.toBe(b);
  });

  it("does not accept malformed stored hashes", async () => {
    await expect(hasher.compare("x", "not-a-hash")).resolves.toBe(false);
    await expect(hasher.compare("x", "")).resolves.toBe(false);
  });

  it("does not ask for a rehash of a fresh hash", async () => {
    expect(hasher.needsRehash(await hasher.hash("Fresh-Password-1"))).toBe(false);
  });

  it("asks for a rehash of a legacy format hash", () => {
    const legacy = `${"a".repeat(32)}:${"b".repeat(128)}`;

    expect(hasher.needsRehash(legacy)).toBe(true);
  });
});
