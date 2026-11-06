import { afterEach, describe, expect, it } from "vitest";
import type { Response } from "express";
import type { SessionRepository } from "../../../src/application/auth/ports/session-repository.port.js";
import type { UserRepository } from "../../../src/application/user/ports/user-repository.port.js";
import {
  actorId,
  makeAuthMiddleware,
  requirePasswordChanged,
  type AuthedRequest,
} from "../../../src/infrastructure/http/middleware/auth.middleware.js";
import { aUser } from "../../support/builders.js";
import { tokensDouble } from "../../support/doubles.js";
import { startApp, stopApps } from "../../support/http.js";
import { stub } from "../../support/stub.js";

afterEach(stopApps);

function setup({
  user = aUser() as ReturnType<typeof aUser> | null,
  active = true,
  issuedAt = Math.floor(Date.now() / 1000),
  verifyFails = false,
} = {}) {
  const tokens = tokensDouble();
  tokens.verify.mockImplementation((token: string) => {
    if (verifyFails) {
      throw new Error("invalid");
    }

    return {
      sub: token.replace("token-for-", ""),
      mustChangePassword: false,
      issuedAt,
      sessionStartedAt: 1_000,
      sessionId: "sid-1",
    };
  });
  const users = stub<UserRepository>({ findById: async () => user });
  const sessions = stub<SessionRepository>({ isActive: async () => active });

  return { tokens, users, sessions };
}

async function call(
  options: ReturnType<typeof setup>,
  { cookie = "token-for-1", ready = false }: { cookie?: string | null; ready?: boolean } = {},
) {
  const authenticate = makeAuthMiddleware(options.tokens, options.users, options.sessions);
  const { url } = await startApp((app) => {
    app.get(
      "/me",
      ready ? requirePasswordChanged(authenticate) : authenticate,
      (req, res: Response) => {
        res.json({ id: actorId(req as AuthedRequest) });
      },
    );
  });

  return fetch(`${url}/me`, {
    headers: cookie ? { cookie: `access_token=${cookie}` } : {},
  });
}

describe("auth middleware", () => {
  it("lets a valid session through and exposes the user id", async () => {
    const response = await call(setup());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ id: 1 });
  });

  it("rejects a request without the session cookie", async () => {
    const response = await call(setup(), { cookie: null });

    expect(response.status).toBe(401);
  });

  it("rejects a token that does not verify", async () => {
    const response = await call(setup({ verifyFails: true }));

    expect(response.status).toBe(401);
  });

  it("rejects a token whose subject is not a valid user id", async () => {
    const response = await call(setup(), { cookie: "token-for-abc" });

    expect(response.status).toBe(401);
  });

  it("rejects a deleted user and clears their cookie", async () => {
    const response = await call(setup({ user: null }));

    expect(response.status).toBe(401);
    expect(response.headers.get("set-cookie")).toContain("access_token=;");
  });

  it("rejects a revoked session and clears the cookie", async () => {
    const options = setup({ active: false });

    const response = await call(options);

    expect(response.status).toBe(401);
    expect(response.headers.get("set-cookie")).toContain("access_token=;");
    expect(options.sessions.isActive).toHaveBeenCalledWith({
      sessionId: "sid-1",
      userId: 1,
      startedAt: 1_000,
    });
  });

  it("renews the cookie when the token is older than five minutes, keeping the session", async () => {
    const options = setup({ issuedAt: Math.floor(Date.now() / 1000) - 400 });

    const response = await call(options);

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toMatch(/access_token=token-for-1/);
    expect(response.headers.get("set-cookie")).toMatch(/HttpOnly/);
    expect(options.tokens.sign).toHaveBeenCalledWith(
      expect.objectContaining({ sub: "1", sessionId: "sid-1", sessionStartedAt: 1_000 }),
    );
  });

  it("does not renew a fresh token", async () => {
    const response = await call(setup());

    expect(response.headers.get("set-cookie")).toBeNull();
  });

  describe("requirePasswordChanged", () => {
    it("blocks users who still have a temporary password", async () => {
      const response = await call(setup({ user: aUser({ mustChangePassword: true }) }), { ready: true });

      expect(response.status).toBe(403);
    });

    it("lets everyone else through", async () => {
      const response = await call(setup(), { ready: true });

      expect(response.status).toBe(200);
    });

    it("reads the flag from the database, not from the token", async () => {
      // The token says mustChangePassword=false, the database says true.
      const response = await call(setup({ user: aUser({ mustChangePassword: true }) }), { ready: true });

      expect(response.status).toBe(403);
    });
  });
});
