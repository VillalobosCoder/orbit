import { Router } from "express";
import type { RequestHandler } from "express";
import type { UserPermissionRepository } from "../../../application/auth/ports/user-permission-repository.port.js";
import type { ProjectController } from "../controllers/project.controller.js";
import { makePermissionMiddleware } from "../middleware/permission.middleware.js";

export function createProjectRoutes(
  controller: ProjectController,
  authenticate: RequestHandler,
  permissions: UserPermissionRepository,
) {
  const router = Router();
  const canRead = makePermissionMiddleware(permissions, "projects", "read");
  const canWrite = makePermissionMiddleware(permissions, "projects", "write");

  router.get("/", authenticate, canRead, controller.getAll);
  router.post("/", authenticate, canWrite, controller.create);
  router.get("/:id", authenticate, canRead, controller.getById);
  router.patch("/:id", authenticate, canWrite, controller.update);
  router.delete("/:id", authenticate, canWrite, controller.delete);

  router.get("/:id/members", authenticate, canRead, controller.getMembers);
  router.get(
    "/:id/available-users",
    authenticate,
    canWrite,
    controller.getAvailableUsers,
  );
  router.post("/:id/members", authenticate, canWrite, controller.addMember);
  router.delete(
    "/:id/members/:userId",
    authenticate,
    canWrite,
    controller.removeMember,
  );

  return router;
}
