import { Router } from "express";
import type { RequestHandler } from "express";
import type { TeamController } from "../controllers/team.controller.js";
import type { UserPermissionRepository } from "../../../application/auth/ports/user-permission-repository.port.js";
import { makePermissionMiddleware } from "../middleware/permission.middleware.js";

export function createTeamRoutes(
  controller: TeamController,
  authenticate: RequestHandler,
  permissions: UserPermissionRepository,
) {
  const router = Router();
  const canRead = makePermissionMiddleware(permissions, "teams", "read");
  const canWrite = makePermissionMiddleware(permissions, "teams", "write");

  router.get("/", authenticate, canRead, controller.getAll);
  router.get("/:id", authenticate, canRead, controller.getById);
  router.post("/", authenticate, canWrite, controller.create);
  router.patch("/:id", authenticate, canWrite, controller.update);
  router.delete("/:id", authenticate, canWrite, controller.delete);

  return router;
}
