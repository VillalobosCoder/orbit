import { afterEach, describe, expect, it, vi } from "vitest";
import * as z from "zod";
import { UserNotFoundError } from "../../../src/domain/user/user.errors.js";
import { startApp, stopApps } from "../../support/http.js";

afterEach(async () => {
  await stopApps();
  vi.restoreAllMocks();
});

async function app() {
  return startApp((server) => {
    server.post("/validate", async (req) => {
      z.object({ name: z.string().min(2) }).parse(req.body);
    });
    server.get("/domain", async () => {
      throw new UserNotFoundError(7);
    });
    server.get("/boom", async () => {
      throw new Error("secret internal detail");
    });
  });
}

describe("error handler", () => {
  it("answers 400 with only the path and message of each invalid field", async () => {
    const { url } = await app();

    const response = await fetch(`${url}/validate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "a" }),
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.details).toEqual([{ path: "name", message: expect.any(String) }]);
    expect(JSON.stringify(body)).not.toContain("pattern");
    expect(JSON.stringify(body)).not.toContain("origin");
  });

  it("translates domain errors to the language of the request", async () => {
    const { url } = await app();

    const spanish = await fetch(`${url}/domain`, { headers: { "accept-language": "es" } });
    const english = await fetch(`${url}/domain`, { headers: { "accept-language": "en" } });

    expect(spanish.status).toBe(404);
    expect((await spanish.json()).error).toMatch(/usuario/i);
    expect((await english.json()).error).toMatch(/user/i);
  });

  it("hides internals on unexpected errors and logs them", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { url } = await app();

    const response = await fetch(`${url}/boom`);
    const text = await response.text();

    expect(response.status).toBe(500);
    expect(text).not.toContain("secret internal detail");
    expect(log).toHaveBeenCalled();
  });

  it("answers 400 to malformed JSON", async () => {
    const { url } = await app();

    const response = await fetch(`${url}/validate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not json",
    });

    expect(response.status).toBe(400);
  });

  it("answers 413 to a body over the limit", async () => {
    const { url } = await app();

    const response = await fetch(`${url}/validate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "x".repeat(20_000) }),
    });

    expect(response.status).toBe(413);
  });
});
