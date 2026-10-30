import type { Request, RequestHandler } from "express";
import type { TokenService } from "../../../application/auth/ports/token-service.port.js";

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
        res
          .status(403)
          .json({ error: "Debes cambiar tu contraseña antes de continuar." });
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
      res.status(401).json({ error: "No autenticado." });
      return;
    }

    let id: number;
    let mustChangePassword: boolean;
    try {
      const payload = tokens.verify(token);
      id = Number(payload.sub);
      mustChangePassword = payload.mustChangePassword === true;
    } catch {
      res.status(401).json({ error: "Sesión inválida o expirada." });
      return;
    }

    if (!Number.isSafeInteger(id) || id <= 0) {
      res.status(401).json({ error: "Sesión inválida o expirada." });
      return;
    }

    (req as AuthedRequest).auth = { id, mustChangePassword };
    next();
  };
}
