import {
  randomBytes,
  scrypt,
  timingSafeEqual,
  type ScryptOptions,
} from "node:crypto";
import { PasswordTooLongError } from "../../domain/user/user.errors.js";
import { Password } from "../../domain/user/value-objects/password.vo.js";

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const CURRENT_VERSION = "v2";

type ScryptProfile = {
  N: number;
  r: number;
  p: number;
  maxmem: number;
};

function createProfile(N: number): ScryptProfile {
  const r = 8;
  const p = 1;
  return {
    N,
    r,
    p,
    maxmem: 128 * N * r + 1024 * 1024,
  };
}

const CURRENT_PROFILE = createProfile(1 << 16);
const SUPPORTED_PROFILES = [
  createProfile(1 << 14),
  createProfile(1 << 15),
  CURRENT_PROFILE,
];

function deriveKey(
  password: string,
  salt: string | Buffer,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, options, (error, key) => {
      if (error) {
        reject(error);
      } else {
        resolve(key);
      }
    });
  });
}

function decodeHex(value: string, expectedLength: number): Buffer | null {
  if (!new RegExp(`^[0-9a-f]{${expectedLength * 2}}$`, "i").test(value)) {
    return null;
  }

  return Buffer.from(value, "hex");
}

function findProfile(N: number, r: number, p: number): ScryptProfile | null {
  return (
    SUPPORTED_PROFILES.find(
      (profile) => profile.N === N && profile.r === r && profile.p === p,
    ) ?? null
  );
}

type ParsedHash = {
  salt: string | Buffer;
  key: Buffer;
  profile: ScryptProfile;
  currentFormat: boolean;
};

function parseStoredHash(storedHash: string): ParsedHash | null {
  const fields = storedHash.split("$");

  if (fields.length === 7 && fields[0] === "scrypt" && fields[1] === CURRENT_VERSION) {
    const [, , NValue, rValue, pValue, saltValue, keyValue] = fields;
    const N = Number(NValue);
    const r = Number(rValue);
    const p = Number(pValue);
    const profile = findProfile(N, r, p);
    const salt = decodeHex(saltValue, SALT_LENGTH);
    const key = decodeHex(keyValue, KEY_LENGTH);

    return profile && salt && key
      ? { salt, key, profile, currentFormat: profile === CURRENT_PROFILE }
      : null;
  }

  if (fields.length === 3 && fields[0] === "scrypt-v1") {
    const salt = decodeHex(fields[1], SALT_LENGTH);
    const key = decodeHex(fields[2], KEY_LENGTH);
    const profile = findProfile(1 << 15, 8, 1);

    return salt && key && profile
      ? { salt, key, profile, currentFormat: false }
      : null;
  }

  const legacyFields = storedHash.split(":");
  if (legacyFields.length === 2) {
    const [salt, keyValue] = legacyFields;
    const validSalt = decodeHex(salt, SALT_LENGTH);
    const key = decodeHex(keyValue, KEY_LENGTH);
    const profile = findProfile(1 << 14, 8, 1);

    return validSalt && key && profile
      ? { salt, key, profile, currentFormat: false }
      : null;
  }

  return null;
}

export class ScryptPasswordHasher {
  async hash(plainPassword: string): Promise<string> {
    if (Password.exceedsByteLimit(plainPassword)) {
      throw new PasswordTooLongError();
    }

    const salt = randomBytes(SALT_LENGTH);
    const key = await deriveKey(plainPassword, salt, CURRENT_PROFILE);

    return [
      "scrypt",
      CURRENT_VERSION,
      CURRENT_PROFILE.N,
      CURRENT_PROFILE.r,
      CURRENT_PROFILE.p,
      salt.toString("hex"),
      key.toString("hex"),
    ].join("$");
  }

  async compare(plainPassword: string, storedHash: string): Promise<boolean> {
    if (
      typeof storedHash !== "string" ||
      Password.exceedsByteLimit(plainPassword)
    ) {
      return false;
    }

    const parsed = parseStoredHash(storedHash);
    if (!parsed) {
      return false;
    }

    const actualKey = await deriveKey(
      plainPassword,
      parsed.salt,
      parsed.profile,
    );
    return timingSafeEqual(actualKey, parsed.key);
  }

  needsRehash(storedHash: string): boolean {
    const parsed = parseStoredHash(storedHash);
    return !parsed || !parsed.currentFormat;
  }
}
