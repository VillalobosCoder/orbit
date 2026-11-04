import type { Request, RequestHandler } from "express";
import { DomainError } from "../../../domain/shared/domain-error.js";
import type {
  TokenService,
  VerifiedToken,
} from "../../../application/auth/ports/token-service.port.js";
import type { UserRepository } from "../../../application/user/ports/user-repository.port.js";
import {
  ACCESS_TOKEN_COOKIE,
  accessTokenCookieOptions,
  accessTokenSetOptions,
} from "../config/cookie.config.js";
import { sendError } from "./locale.middleware.js";

class NotAuthenticatedError extends DomainError {
  readonly statusCode = 401;

  constructor() {
    super("errors.http.notAuthenticated");
  }
}

export function actorId(req: AuthedRequest): number {
  const id = req.auth?.id;

  if (id === undefined) {
    throw new NotAuthenticatedError();
  }

  return id;
}

const RENEW_AFTER_SECONDS = 5 * 60;

export interface AuthedRequest extends Request {
  auth?: {
    id: number;
    mustChangePassword: boolean;
  };
}

export function requirePasswordChanged(
  authenticate: RequestHandler,
): RequestHandler {
  return (req, res, next) => {
    authenticate(req, res, (error?: unknown) => {
      if (error) {
        next(error);
        return;
      }

      if ((req as AuthedRequest).auth?.mustChangePassword) {
        sendError(res, 403, "errors.http.mustChangePassword");
        return;
      }

      next();
    });
  };
}

export function makeAuthMiddleware(
  tokens: TokenService,
  users: UserRepository,
): RequestHandler {
  return async (req, res, next) => {
    const token: unknown = req.cookies?.[ACCESS_TOKEN_COOKIE];

    if (typeof token !== "string" || token.length === 0) {
      sendError(res, 401, "errors.http.notAuthenticated");
      return;
    }

    let verified: VerifiedToken;

    try {
      verified = tokens.verify(token);
    } catch {
      sendError(res, 401, "errors.http.sessionExpired");
      return;
    }

    const id = Number(verified.sub);

    if (!Number.isSafeInteger(id) || id <= 0) {
      sendError(res, 401, "errors.http.sessionExpired");
      return;
    }

    try {
      const user = await users.findById(id);

      if (!user) {
        res.clearCookie(ACCESS_TOKEN_COOKIE, accessTokenCookieOptions);
        sendError(res, 401, "errors.http.sessionInvalid");
        return;
      }

      const mustChangePassword = user.mustChangePassword;

      if (Date.now() / 1000 - verified.issuedAt > RENEW_AFTER_SECONDS) {
        res.cookie(
          ACCESS_TOKEN_COOKIE,
          tokens.sign({
            sub: verified.sub,
            mustChangePassword,
            sessionStartedAt: verified.sessionStartedAt,
          }),
          accessTokenSetOptions,
        );
      }

      (req as AuthedRequest).auth = { id, mustChangePassword };
      next();
    } catch (error) {
      next(error);
    }
  };
}
