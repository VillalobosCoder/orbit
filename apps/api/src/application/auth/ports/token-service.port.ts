export type TokenPayload = {
  sub: string;
  mustChangePassword?: boolean;
  sessionStartedAt?: number;
};

export type VerifiedToken = {
  sub: string;
  mustChangePassword: boolean;
  issuedAt: number;
  sessionStartedAt: number;
};

export interface TokenService {
  sign(payload: TokenPayload): string;
  verify(token: string): VerifiedToken;
}
