import { Router } from "express";
import type { RequestHandler } from "express";
import type { AuthController } from "../controllers/auth.controller.js";
import { RATE_LIMITS } from "../config/rate-limit.config.js";
import { makeRateLimitMiddleware } from "../middleware/rate-limit.middleware.js";

export function createAuthRoutes(
  controller: AuthController,
  authenticate: RequestHandler,
) {
  const router = Router();
  const loginRateLimit = makeRateLimitMiddleware(RATE_LIMITS.login);
  const changePasswordRateLimit = makeRateLimitMiddleware(
    RATE_LIMITS.changePassword,
  );

  router.post("/login", loginRateLimit, controller.login);
  router.get("/me", authenticate, controller.me);
  router.patch(
    "/password",
    authenticate,
    changePasswordRateLimit,
    controller.changePassword,
  );
  router.post("/logout", controller.logout);

  return router;
}
