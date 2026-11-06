import type { PasswordHasher } from "../../src/application/user/ports/password-hasher.port.js";
import type { TransactionManager } from "../../src/application/shared/ports/transaction-manager.port.js";
import type { TokenService } from "../../src/application/auth/ports/token-service.port.js";
import { stub } from "./stub.js";

export function transactionDouble(): TransactionManager {
  return { run: (work) => work() };
}

export function hasherDouble() {
  return stub<PasswordHasher>({
    hash: async (plain) => `hash:${plain}`,
    compare: async (plain, hash) => hash === `hash:${plain}`,
    needsRehash: () => false,
  });
}

export function tokensDouble() {
  return stub<TokenService>({
    sign: (payload) => `token-for-${payload.sub}`,
    verify: (token) => ({
      sub: token.replace("token-for-", ""),
      mustChangePassword: false,
      issuedAt: 0,
      sessionStartedAt: 1_000,
      sessionId: `session-of-${token}`,
    }),
  });
}
