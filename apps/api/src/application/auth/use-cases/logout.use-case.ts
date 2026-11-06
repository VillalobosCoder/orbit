import { SESSION_MAX_SECONDS } from "../session.policy.js";
import type { SessionRepository } from "../ports/session-repository.port.js";
import type { TokenService } from "../ports/token-service.port.js";

export class LogoutUseCase {
  constructor(
    private readonly tokens: TokenService,
    private readonly sessions: SessionRepository,
  ) {}

  async execute(token: string | undefined): Promise<void> {
    if (!token) {
      return;
    }

    let verified;

    try {
      verified = this.tokens.verify(token);
    } catch {
      return;
    }

    await this.sessions.revoke({
      sessionId: verified.sessionId,
      expiresAt: new Date(
        verified.sessionStartedAt + SESSION_MAX_SECONDS * 1000,
      ),
    });
  }
}
