import { Router } from "express";
import type { RequestHandler } from "express";
import type { NotificationController } from "../controllers/notification.controller.js";

export function createNotificationRoutes(
  controller: NotificationController,
  authenticate: RequestHandler,
) {
  const router = Router();

  router.get("/", authenticate, controller.getAll);
  router.put("/preference", authenticate, controller.setPreference);
  router.post("/read-all", authenticate, controller.markAllRead);
  router.patch("/:id/read", authenticate, controller.markRead);

  return router;
}
