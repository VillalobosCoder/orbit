import jwt from "jsonwebtoken";
import { describe, expect, it } from "vitest";
import { JwtTokenService } from "../../../src/infrastructure/security/jwt-token-service.js";

const SECRET = "a-test-secret-with-more-than-32-bytes!!";
const claims = { audience: "orbit-api", issuer: "orbit-api", algorithm: "HS256" as const };

function raw(payload: object, options: Partial<jwt.SignOptions> = {}, secret = SECRET) {
  return jwt.sign(payload, secret, { ...claims, expiresIn: 900, ...options });
}

describe("JwtTokenService", () => {
  const service = new JwtTokenService(SECRET);

  it("refuses to start with a short or missing secret", () => {
    expect(() => new JwtTokenService("short")).toThrow();
    expect(() => new JwtTokenService(undefined)).toThrow();
  });

  it("signs a token that verifies back to the same user and session", () => {
    const token = service.sign({ sub: "7", mustChangePassword: true });

    const verified = service.verify(token);

    expect(verified).toMatchObject({ sub: "7", mustChangePassword: true });
    expect(verified.sessionId).toEqual(expect.any(String));
    expect(Math.abs(verified.sessionStartedAt - Date.now())).toBeLessThan(5000);
  });

  it("keeps the same session id and start when a session is renewed", () => {
    const first = service.verify(service.sign({ sub: "7" }));

    const renewed = service.verify(
      service.sign({
        sub: "7",
        sessionId: first.sessionId,
        sessionStartedAt: first.sessionStartedAt,
      }),
    );

    expect(renewed.sessionId).toBe(first.sessionId);
    expect(renewed.sessionStartedAt).toBe(first.sessionStartedAt);
  });

  it("gives every new login its own session id", () => {
    const a = service.verify(service.sign({ sub: "7" }));
    const b = service.verify(service.sign({ sub: "7" }));

    expect(a.sessionId).not.toBe(b.sessionId);
  });

  it("rejects an empty subject", () => {
    expect(() => service.sign({ sub: " " })).toThrow();
  });

  it("rejects tokens signed with another secret", () => {
    const forged = raw({ sub: "1", sid: "x" }, {}, "another-secret-with-more-than-32-bytes!!");

    expect(() => service.verify(forged)).toThrow();
  });

  it("rejects the unsigned 'none' algorithm", () => {
    const unsigned = `${Buffer.from('{"alg":"none","typ":"JWT"}').toString("base64url")}.${Buffer.from(
      JSON.stringify({ sub: "1", sid: "x", aud: "orbit-api", iss: "orbit-api", exp: 9999999999 }),
    ).toString("base64url")}.`;

    expect(() => service.verify(unsigned)).toThrow();
  });

  it("rejects the wrong audience or issuer", () => {
    expect(() => service.verify(raw({ sub: "1", sid: "x" }, { audience: "other" }))).toThrow();
    expect(() => service.verify(raw({ sub: "1", sid: "x" }, { issuer: "other" }))).toThrow();
  });

  it("rejects an expired token", () => {
    const now = Math.floor(Date.now() / 1000);

    expect(() => service.verify(raw({ sub: "1", sid: "x", iat: now - 2000, exp: now - 1000 }, { expiresIn: undefined }))).toThrow();
  });

  it("rejects a token without a session id", () => {
    expect(() => service.verify(raw({ sub: "1" }))).toThrow();
  });

  it("rejects a session older than 12 hours even if the token itself is fresh", () => {
    const tooOld = Date.now() - 13 * 60 * 60 * 1000;

    expect(() => service.verify(raw({ sub: "1", sid: "x", sat: tooOld }))).toThrow();
  });

  it("rejects tokens that last longer than the allowed 15 minutes", () => {
    expect(() => service.verify(raw({ sub: "1", sid: "x" }, { expiresIn: 3600 }))).toThrow();
  });

  it("rejects garbage", () => {
    expect(() => service.verify("not-a-token")).toThrow();
  });
});
