import type { RequestHandler } from "express";
import type {
  PermissionAction,
  UserPermissionRepository,
} from "../../../application/auth/ports/user-permission-repository.port.js";
import type { AuthedRequest } from "./auth.middleware.js";

export function makePermissionMiddleware(
  permissions: UserPermissionRepository,
  moduleKey: string,
  action: PermissionAction,
): RequestHandler {
  return async (req, res, next) => {
    const userId = (req as AuthedRequest).auth?.id;

    if (userId === undefined) {
      res.status(401).json({ error: "No autenticado." });
      return;
    }

    try {
      const allowed = await permissions.hasPermission(
        userId,
        moduleKey,
        action,
      );

      if (!allowed) {
        res.status(403).json({ error: "No tienes permiso para esta acción." });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
