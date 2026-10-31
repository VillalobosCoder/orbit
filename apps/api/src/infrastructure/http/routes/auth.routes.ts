import { Router, raw } from "express";
import { AVATAR_MAX_BYTES, AVATAR_MIME_TYPES } from "@orbit/shared";
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

  const uploadAvatarRateLimit = makeRateLimitMiddleware(
    RATE_LIMITS.uploadAvatar,
  );

  router.post("/login", loginRateLimit, controller.login);
  router.get("/me", authenticate, controller.me);
  router.patch("/me", authenticate, controller.updateProfile);
  router.patch(
    "/password",
    authenticate,
    changePasswordRateLimit,
    controller.changePassword,
  );
  router.put(
    "/me/avatar",
    authenticate,
    uploadAvatarRateLimit,
    raw({ type: [...AVATAR_MIME_TYPES], limit: AVATAR_MAX_BYTES }),
    controller.uploadAvatar,
  );
  router.delete("/me/avatar", authenticate, controller.removeAvatar);
  router.post("/logout", controller.logout);

  return router;
}
