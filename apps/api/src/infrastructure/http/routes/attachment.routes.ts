import { Router, raw } from "express";
import type { RequestHandler } from "express";
import {
  ATTACHMENT_MIME_TYPES,
  ATTACHMENT_VIDEO_MAX_BYTES,
  ModuleKey,
} from "@orbit/shared";
import type { UserPermissionRepository } from "../../../application/auth/ports/user-permission-repository.port.js";
import { RATE_LIMITS } from "../config/rate-limit.config.js";
import type { AttachmentController } from "../controllers/attachment.controller.js";
import { makePermissionMiddleware } from "../middleware/permission.middleware.js";
import { makeRateLimitMiddleware } from "../middleware/rate-limit.middleware.js";

export function createAttachmentRoutes(
  controller: AttachmentController,
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
  const uploadRateLimit = makeRateLimitMiddleware(RATE_LIMITS.uploadAttachment);

  router.get("/", authenticate, canRead, controller.getAll);
  router.post(
    "/",
    authenticate,
    canWriteIssues,
    uploadRateLimit,
    raw({ type: [...ATTACHMENT_MIME_TYPES], limit: ATTACHMENT_VIDEO_MAX_BYTES }),
    controller.upload,
  );
  router.get("/:attachmentId", authenticate, canRead, controller.getContent);
  router.delete(
    "/:attachmentId",
    authenticate,
    canWriteIssues,
    controller.delete,
  );

  return router;
}
