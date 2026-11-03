import { Router } from "express";
import type { RequestHandler } from "express";
import type { UserPermissionRepository } from "../../../application/auth/ports/user-permission-repository.port.js";
import {
  ATTACHMENT_MIME_TYPES,
  ATTACHMENT_VIDEO_MAX_BYTES,
} from "@orbit/shared";
import { raw } from "express";
import { RATE_LIMITS } from "../config/rate-limit.config.js";
import type { AttachmentController } from "../controllers/attachment.controller.js";
import { makeRateLimitMiddleware } from "../middleware/rate-limit.middleware.js";
import type { CommentController } from "../controllers/comment.controller.js";
import { makePermissionMiddleware } from "../middleware/permission.middleware.js";

export function createCommentRoutes(
  controller: CommentController,
  attachments: AttachmentController,
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
  router.post(
    "/:commentId/attachments",
    authenticate,
    canWrite,
    makeRateLimitMiddleware(RATE_LIMITS.uploadAttachment),
    raw({ type: [...ATTACHMENT_MIME_TYPES], limit: ATTACHMENT_VIDEO_MAX_BYTES }),
    attachments.upload,
  );
  router.delete(
    "/:commentId/attachments/:attachmentId",
    authenticate,
    canWrite,
    attachments.delete,
  );

  return router;
}
