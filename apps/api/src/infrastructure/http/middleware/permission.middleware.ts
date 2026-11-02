import type { RequestHandler } from "express";
import type {
  PermissionAction,
  UserPermissionRepository,
} from "../../../application/auth/ports/user-permission-repository.port.js";
import type { AuthedRequest } from "./auth.middleware.js";
import { sendError } from "./locale.middleware.js";

export function makePermissionMiddleware(
  permissions: UserPermissionRepository,
  moduleKey: string,
  action: PermissionAction,
): RequestHandler {
  return async (req, res, next) => {
    const userId = (req as AuthedRequest).auth?.id;

    if (userId === undefined) {
      sendError(res, 401, "errors.http.notAuthenticated");
      return;
    }

    try {
      const allowed = await permissions.hasPermission(
        userId,
        moduleKey,
        action,
      );

      if (!allowed) {
        sendError(res, 403, "errors.http.forbidden");
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
