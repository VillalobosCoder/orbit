import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import type { Request, RequestHandler } from "express";
import type { RateLimitConfig } from "../config/rate-limit.config.js";
import { sendError } from "./locale.middleware.js";

function emailOf(req: Request): string {
  const email: unknown = req.body?.email;

  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export function makeRateLimitMiddleware(
  { windowMs, limit }: RateLimitConfig,
  options: { perEmail?: boolean } = {},
): RequestHandler {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    keyGenerator: (req) => {
      const ip = ipKeyGenerator(req.ip ?? "");

      return options.perEmail ? `${ip}|${emailOf(req)}` : ip;
    },
    handler: (_req, res) => sendError(res, 429, "errors.http.tooManyAttempts"),
  });
}
