export type TokenPayload = {
  sub: string;
};

export interface TokenService {
  sign(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}
