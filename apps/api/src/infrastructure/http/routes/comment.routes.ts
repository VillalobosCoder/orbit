import { Router } from "express";
import type { RequestHandler } from "express";
import type { UserPermissionRepository } from "../../../application/auth/ports/user-permission-repository.port.js";
import type { CommentController } from "../controllers/comment.controller.js";
import { makePermissionMiddleware } from "../middleware/permission.middleware.js";

export function createCommentRoutes(
  controller: CommentController,
  authenticate: RequestHandler,
  permissions: UserPermissionRepository,
) {
  const router = Router({ mergeParams: true });
  const canRead = makePermissionMiddleware(permissions, "projects", "read");
  const canWrite = makePermissionMiddleware(permissions, "projects", "write");

  router.get("/", authenticate, canRead, controller.getAll);
  router.post("/", authenticate, canWrite, controller.create);
  router.patch("/:commentId", authenticate, canWrite, controller.update);
  router.delete("/:commentId", authenticate, canWrite, controller.delete);

  return router;
}
