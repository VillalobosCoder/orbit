export interface SessionRepository {
  isActive(query: {
    sessionId: string;
    userId: number;
    startedAt: number;
  }): Promise<boolean>;
  revoke(command: { sessionId: string; expiresAt: Date }): Promise<void>;
  revokeAllForUser(userId: number): Promise<void>;
}
