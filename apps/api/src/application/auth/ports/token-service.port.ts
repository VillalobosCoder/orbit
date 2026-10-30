export type TokenPayload = {
  sub: string;
  mustChangePassword?: boolean;
};

export interface TokenService {
  sign(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}
