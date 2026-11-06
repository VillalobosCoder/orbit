import { eq, lt } from "drizzle-orm";
import type { SessionRepository } from "../../../application/auth/ports/session-repository.port.js";
import type { DbContext } from "../db-context.js";
import { revokedSessions } from "../schema/revoked-sessions.js";
import { users } from "../schema/users.js";

export class DBSessionRepository implements SessionRepository {
  constructor(private readonly context: DbContext) {}

  private get db() {
    return this.context.db;
  }

  async isActive({
    sessionId,
    userId,
    startedAt,
  }: {
    sessionId: string;
    userId: number;
    startedAt: number;
  }): Promise<boolean> {
    const [revoked] = await this.db
      .select({ id: revokedSessions.id })
      .from(revokedSessions)
      .where(eq(revokedSessions.id, sessionId))
      .limit(1);

    if (revoked) {
      return false;
    }

    const [user] = await this.db
      .select({ validAfter: users.sessionsValidAfter })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user?.validAfter) {
      return true;
    }

    return startedAt >= user.validAfter.getTime();
  }

  async revoke({
    sessionId,
    expiresAt,
  }: {
    sessionId: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.db
      .delete(revokedSessions)
      .where(lt(revokedSessions.expiresAt, new Date()));
    await this.db
      .insert(revokedSessions)
      .values({ id: sessionId, expiresAt })
      .onConflictDoNothing();
  }

  async revokeAllForUser(userId: number): Promise<void> {
    await this.db
      .update(users)
      .set({ sessionsValidAfter: new Date() })
      .where(eq(users.id, userId));
  }
}
