import { Router } from "express";
import type { RequestHandler } from "express";
import type { UserPermissionRepository } from "../../../application/auth/ports/user-permission-repository.port.js";
import type { IssueController } from "../controllers/issue.controller.js";
import { makePermissionMiddleware } from "../middleware/permission.middleware.js";

/** Se monta en `/projects/:id`: los issues heredan el permiso del módulo `projects`. */
export function createIssueRoutes(
  controller: IssueController,
  authenticate: RequestHandler,
  permissions: UserPermissionRepository,
) {
  const router = Router({ mergeParams: true });
  const canRead = makePermissionMiddleware(permissions, "projects", "read");
  const canWrite = makePermissionMiddleware(permissions, "projects", "write");

  router.get("/board", authenticate, canRead, controller.getBoard);
  router.get("/issue-options", authenticate, canRead, controller.getOptions);
  router.post("/issues", authenticate, canWrite, controller.create);
  router.get("/issues/:issueId", authenticate, canRead, controller.getById);
  router.patch("/issues/:issueId", authenticate, canWrite, controller.update);
  router.patch("/issues/:issueId/move", authenticate, canWrite, controller.move);
  router.delete("/issues/:issueId", authenticate, canWrite, controller.delete);

  return router;
}
