import { Router } from "express";
import type { RequestHandler } from "express";
import type { UserPermissionRepository } from "../../../application/auth/ports/user-permission-repository.port.js";
import type { IssueController } from "../controllers/issue.controller.js";
import { ModuleKey } from "@orbit/shared";
import { makePermissionMiddleware } from "../middleware/permission.middleware.js";

/** Se monta en `/projects/:id`: leer exige `projects`; escribir y mover tienen su propio submódulo. */
export function createIssueRoutes(
  controller: IssueController,
  authenticate: RequestHandler,
  permissions: UserPermissionRepository,
) {
  const router = Router({ mergeParams: true });
  const canRead = makePermissionMiddleware(permissions, "projects", "read");
  const canWriteIssues = makePermissionMiddleware(
    permissions,
    ModuleKey.PROJECT_ISSUES,
    "write",
  );
  const canMoveIssues = makePermissionMiddleware(
    permissions,
    ModuleKey.PROJECT_MOVE_ISSUES,
    "write",
  );

  router.get("/board", authenticate, canRead, controller.getBoard);
  router.get("/issue-options", authenticate, canRead, controller.getOptions);
  router.post("/issues", authenticate, canWriteIssues, controller.create);
  router.get("/issues/:issueId", authenticate, canRead, controller.getById);
  router.patch("/issues/:issueId", authenticate, canWriteIssues, controller.update);
  router.patch(
    "/issues/:issueId/move",
    authenticate,
    canMoveIssues,
    controller.move,
  );
  router.delete("/issues/:issueId", authenticate, canWriteIssues, controller.delete);

  return router;
}
