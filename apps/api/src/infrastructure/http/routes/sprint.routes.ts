import { Router } from "express";
import type { RequestHandler } from "express";
import type { UserPermissionRepository } from "../../../application/auth/ports/user-permission-repository.port.js";
import type { SprintController } from "../controllers/sprint.controller.js";
import { makePermissionMiddleware } from "../middleware/permission.middleware.js";

/** Se monta en `/projects/:id`: los sprints heredan el permiso del módulo `projects`. */
export function createSprintRoutes(
  controller: SprintController,
  authenticate: RequestHandler,
  permissions: UserPermissionRepository,
) {
  const router = Router({ mergeParams: true });
  const canRead = makePermissionMiddleware(permissions, "projects", "read");
  const canWrite = makePermissionMiddleware(permissions, "projects", "write");

  router.get("/planning", authenticate, canRead, controller.getPlanning);
  router.post("/sprints", authenticate, canWrite, controller.create);
  router.patch("/sprints/:sprintId", authenticate, canWrite, controller.update);
  router.delete("/sprints/:sprintId", authenticate, canWrite, controller.delete);
  router.post(
    "/sprints/:sprintId/start",
    authenticate,
    canWrite,
    controller.start,
  );
  router.post(
    "/sprints/:sprintId/close",
    authenticate,
    canWrite,
    controller.close,
  );
  router.patch(
    "/issues/:issueId/sprint",
    authenticate,
    canWrite,
    controller.assignIssue,
  );

  return router;
}
