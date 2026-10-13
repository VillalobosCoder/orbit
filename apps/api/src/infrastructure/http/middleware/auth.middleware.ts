import type { Request, RequestHandler } from "express";
import type { TokenService } from "../../../application/auth/ports/token-service.port.js";

export interface AuthedRequest extends Request {
  auth?: {
    id: number;
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
    try {
      id = Number(tokens.verify(token).sub);
    } catch {
      res.status(401).json({ error: "Sesión inválida o expirada." });
      return;
    }

    if (!Number.isSafeInteger(id) || id <= 0) {
      res.status(401).json({ error: "Sesión inválida o expirada." });
      return;
    }

    (req as AuthedRequest).auth = { id };
    next();
  };
}
