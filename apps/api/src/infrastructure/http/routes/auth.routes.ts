import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import type { AuthController } from "../controllers/auth.controller.js";
import type { RequestHandler } from "express";

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Intenta de nuevo más tarde." },
});

export function createAuthRoutes(
  controller: AuthController,
  authenticate: RequestHandler,
) {
  const router = Router();

  router.post("/login", loginRateLimit, controller.login);
  router.get("/me", authenticate, controller.me);
  router.post("/logout", controller.logout);

  return router;
}