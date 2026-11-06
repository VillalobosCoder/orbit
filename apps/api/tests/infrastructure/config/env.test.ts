import { describe, expect, it } from "vitest";
import { loadDatabaseEnv, loadEnv } from "../../../src/infrastructure/config/env.js";

const valid = {
  PORT: "3000",
  HOSTNAME: "0.0.0.0",
  DATABASE_URL: "localhost",
  DATABASE_PORT: "5432",
  DATABASE_NAME: "orbit",
  DATABASE_USER: "orbit",
  DATABASE_PASSWORD: "secret",
  JWT_SECRET: "x".repeat(32),
};

describe("loadEnv", () => {
  it("parses the numbers and applies defaults", () => {
    const env = loadEnv(valid);

    expect(env).toMatchObject({ PORT: 3000, DATABASE_PORT: 5432, STORAGE_DIR: "storage", TRUST_PROXY: 0 });
  });

  it("treats empty optional variables as unset", () => {
    const env = loadEnv({ ...valid, STORAGE_DIR: "", TRUST_PROXY: "" });

    expect(env.STORAGE_DIR).toBe("storage");
    expect(env.TRUST_PROXY).toBe(0);
  });

  it("reads the proxy count and the storage directory", () => {
    const env = loadEnv({ ...valid, TRUST_PROXY: "1", STORAGE_DIR: "/data/storage" });

    expect(env).toMatchObject({ TRUST_PROXY: 1, STORAGE_DIR: "/data/storage" });
  });

  it("names every missing or invalid variable in one error", () => {
    let message = "";

    try {
      loadEnv({ PORT: "abc", JWT_SECRET: "short" });
    } catch (error) {
      message = (error as Error).message;
    }

    for (const name of ["PORT", "HOSTNAME", "DATABASE_URL", "DATABASE_PASSWORD", "JWT_SECRET"]) {
      expect(message).toContain(name);
    }
  });

  it("rejects a JWT secret shorter than 32 bytes", () => {
    expect(() => loadEnv({ ...valid, JWT_SECRET: "x".repeat(31) })).toThrow(/JWT_SECRET/);
  });

  it("rejects ports out of range", () => {
    expect(() => loadEnv({ ...valid, PORT: "70000" })).toThrow(/PORT/);
  });
});

describe("loadDatabaseEnv", () => {
  it("only needs the database variables", () => {
    const { PORT, HOSTNAME, JWT_SECRET, ...database } = valid;
    void PORT; void HOSTNAME; void JWT_SECRET;

    expect(loadDatabaseEnv(database)).toMatchObject({ DATABASE_NAME: "orbit", DATABASE_PORT: 5432 });
  });
});
