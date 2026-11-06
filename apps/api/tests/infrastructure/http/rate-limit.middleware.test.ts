import { afterEach, describe, expect, it } from "vitest";
import { makeRateLimitMiddleware } from "../../../src/infrastructure/http/middleware/rate-limit.middleware.js";
import { startApp, stopApps } from "../../support/http.js";

afterEach(stopApps);

async function post(url: string, email: string) {
  const response = await fetch(`${url}/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email }),
  });

  return response.status;
}

describe("rate limit middleware", () => {
  it("blocks the sixth attempt for the same email from the same address", async () => {
    const { url } = await startApp((app) => {
      app.post(
        "/login",
        makeRateLimitMiddleware({ windowMs: 60_000, limit: 5 }, { perEmail: true }),
        (_req, res) => {
          res.status(401).json({});
        },
      );
    });

    const statuses = [];
    for (let attempt = 0; attempt < 6; attempt += 1) {
      statuses.push(await post(url, "ada@example.com"));
    }

    expect(statuses).toEqual([401, 401, 401, 401, 401, 429]);
  });

  it("counts each email separately and ignores letter case", async () => {
    const { url } = await startApp((app) => {
      app.post(
        "/login",
        makeRateLimitMiddleware({ windowMs: 60_000, limit: 2 }, { perEmail: true }),
        (_req, res) => {
          res.status(401).json({});
        },
      );
    });

    await post(url, "ada@example.com");
    await post(url, "ADA@example.com");

    expect(await post(url, "Ada@Example.com")).toBe(429);
    expect(await post(url, "bob@example.com")).toBe(401);
  });

  it("limits by address alone when the email is not part of the key", async () => {
    const { url } = await startApp((app) => {
      app.post(
        "/login",
        makeRateLimitMiddleware({ windowMs: 60_000, limit: 2 }),
        (_req, res) => {
          res.status(401).json({});
        },
      );
    });

    await post(url, "a@example.com");
    await post(url, "b@example.com");

    expect(await post(url, "c@example.com")).toBe(429);
  });
});
