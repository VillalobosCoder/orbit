export type TokenPayload = {
  sub: string;
  mustChangePassword?: boolean;
  sessionStartedAt?: number;
  sessionId?: string;
};

/** `sessionStartedAt` is in milliseconds since the epoch. */
export type VerifiedToken = {
  sub: string;
  mustChangePassword: boolean;
  issuedAt: number;
  sessionStartedAt: number;
  sessionId: string;
};

export interface TokenService {
  sign(payload: TokenPayload): string;
  verify(token: string): VerifiedToken;
}
