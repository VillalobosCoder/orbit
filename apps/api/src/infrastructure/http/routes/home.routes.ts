import { Router } from "express";
import type { RequestHandler } from "express";
import type { UserPermissionRepository } from "../../../application/auth/ports/user-permission-repository.port.js";
import type { HomeController } from "../controllers/home.controller.js";
import { makePermissionMiddleware } from "../middleware/permission.middleware.js";

export function createHomeRoutes(
  controller: HomeController,
  authenticate: RequestHandler,
  permissions: UserPermissionRepository,
) {
  const router = Router();

  router.get(
    "/summary",
    authenticate,
    makePermissionMiddleware(permissions, "projects", "read"),
    controller.getSummary,
  );

  return router;
}
