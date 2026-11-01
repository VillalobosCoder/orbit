import { Router } from "express";
import type { RequestHandler } from "express";
import type { UserPermissionRepository } from "../../../application/auth/ports/user-permission-repository.port.js";
import type { BoardColumnController } from "../controllers/board-column.controller.js";
import { ModuleKey } from "@orbit/shared";
import { makePermissionMiddleware } from "../middleware/permission.middleware.js";

/** Se monta en `/projects/:id/columns`. */
export function createBoardColumnRoutes(
  controller: BoardColumnController,
  authenticate: RequestHandler,
  permissions: UserPermissionRepository,
) {
  const router = Router({ mergeParams: true });
  const canWrite = makePermissionMiddleware(
    permissions,
    ModuleKey.PROJECT_COLUMNS,
    "write",
  );

  router.post("/", authenticate, canWrite, controller.create);
  router.put("/order", authenticate, canWrite, controller.reorder);
  router.patch("/:columnId", authenticate, canWrite, controller.update);
  router.delete("/:columnId", authenticate, canWrite, controller.delete);

  return router;
}
