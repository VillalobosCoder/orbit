import { rateLimit } from "express-rate-limit";
import type { RequestHandler } from "express";
import type { RateLimitConfig } from "../config/rate-limit.config.js";

export function makeRateLimitMiddleware({
  windowMs,
  limit,
}: RateLimitConfig): RequestHandler {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Demasiados intentos. Intenta de nuevo más tarde." },
  });
}
