import { Router } from "express";
import type { RequestHandler } from "express";
import type { UserController } from "../controllers/user.controller.js";
import type { UserPermissionRepository } from "../../../application/auth/ports/user-permission-repository.port.js";
import { makePermissionMiddleware } from "../middleware/permission.middleware.js";

export function UserRoutes(
  controller: UserController,
  authenticate: RequestHandler,
  permissions: UserPermissionRepository,
) {
  const router = Router();

  router.get(
    "/",
    authenticate,
    makePermissionMiddleware(permissions, "users", "read"),
    controller.getAllUsers,
  );
  router.post(
    "/",
    authenticate,
    makePermissionMiddleware(permissions, "users", "write"),
    controller.create,
  );
  router.delete(
    "/:id",
    authenticate,
    makePermissionMiddleware(permissions, "users", "write"),
    controller.delete,
  );

  return router;
}