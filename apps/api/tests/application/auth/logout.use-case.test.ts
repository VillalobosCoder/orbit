import { describe, expect, it } from "vitest";
import type { SessionRepository } from "../../../src/application/auth/ports/session-repository.port.js";
import { SESSION_MAX_SECONDS } from "../../../src/application/auth/session.policy.js";
import { LogoutUseCase } from "../../../src/application/auth/use-cases/logout.use-case.js";
import { tokensDouble } from "../../support/doubles.js";
import { stub } from "../../support/stub.js";

function setup() {
  const sessions = stub<SessionRepository>({ revoke: async () => undefined });
  const tokens = tokensDouble();

  return { sessions, tokens, useCase: new LogoutUseCase(tokens, sessions) };
}

describe("LogoutUseCase", () => {
  it("revokes the session of the token until the session would expire anyway", async () => {
    const { useCase, sessions } = setup();

    await useCase.execute("token-for-7");

    expect(sessions.revoke).toHaveBeenCalledWith({
      sessionId: "session-of-token-for-7",
      expiresAt: new Date(1_000 + SESSION_MAX_SECONDS * 1000),
    });
  });

  it("does nothing when there is no cookie", async () => {
    const { useCase, sessions } = setup();

    await useCase.execute(undefined);

    expect(sessions.revoke).not.toHaveBeenCalled();
  });

  it("ignores a token that cannot be verified", async () => {
    const { useCase, sessions, tokens } = setup();
    tokens.verify.mockImplementation(() => {
      throw new Error("invalid");
    });

    await expect(useCase.execute("garbage")).resolves.toBeUndefined();

    expect(sessions.revoke).not.toHaveBeenCalled();
  });
});
