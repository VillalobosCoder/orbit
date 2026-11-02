import { rateLimit } from "express-rate-limit";
import type { RequestHandler } from "express";
import type { RateLimitConfig } from "../config/rate-limit.config.js";
import { sendError } from "./locale.middleware.js";

export function makeRateLimitMiddleware({
  windowMs,
  limit,
}: RateLimitConfig): RequestHandler {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_req, res) => sendError(res, 429, "errors.http.tooManyAttempts"),
  });
}
