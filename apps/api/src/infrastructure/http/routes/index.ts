import { Router } from "express";
import type { RequestHandler } from "express";
import type { AuthController } from "../controllers/auth.controller.js";
import type { UserController } from "../controllers/user.controller.js";
import type { TeamController } from "../controllers/team.controller.js";
import type { ModuleController } from "../controllers/module.controller.js";
import { createAuthRoutes } from "./auth.routes.js";
import { UserRoutes } from "./user.routes.js";
import { createModuleRoutes } from "./module.routes.js";
import { createTeamRoutes } from "./team.routes.js";
import type { UserPermissionRepository } from "../../../application/auth/ports/user-permission-repository.port.js";

export interface RouteControllers {
  auth: AuthController;
  users: UserController;
  modules: ModuleController;
  teams: TeamController;
}

export function createApiRoutes(
  controllers: RouteControllers,
  authenticate: RequestHandler,
  permissions: UserPermissionRepository,
) {
  const router = Router();

  router.use("/auth", createAuthRoutes(controllers.auth, authenticate));
  router.use(
    "/users",
    UserRoutes(controllers.users, authenticate, permissions),
  );
  router.use(
    "/teams",
    createTeamRoutes(controllers.teams, authenticate, permissions),
  );
  router.use("/modules", createModuleRoutes(controllers.modules, authenticate));

  return router;
}