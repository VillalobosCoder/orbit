import type { Request, RequestHandler } from "express";
import type { TokenService } from "../../../application/auth/ports/token-service.port.js";
import { sendError } from "./locale.middleware.js";

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

export function makeAuthMiddleware(tokens: TokenService): RequestHandler {
  return (req, res, next) => {
    const token: unknown = req.cookies?.access_token;

    if (typeof token !== "string" || token.length === 0) {
      sendError(res, 401, "errors.http.notAuthenticated");
      return;
    }

    let id: number;
    let mustChangePassword: boolean;
    try {
      const payload = tokens.verify(token);
      id = Number(payload.sub);
      mustChangePassword = payload.mustChangePassword === true;
    } catch {
      sendError(res, 401, "errors.http.sessionExpired");
      return;
    }

    if (!Number.isSafeInteger(id) || id <= 0) {
      sendError(res, 401, "errors.http.sessionExpired");
      return;
    }

    (req as AuthedRequest).auth = { id, mustChangePassword };
    next();
  };
}
