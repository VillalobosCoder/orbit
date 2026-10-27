import { Router } from "express";
import type { RequestHandler } from "express";
import type { AuthController } from "../controllers/auth.controller.js";
import type { UserController } from "../controllers/user.controller.js";
import type { CommentController } from "../controllers/comment.controller.js";
import type { IssueController } from "../controllers/issue.controller.js";
import type { ProjectController } from "../controllers/project.controller.js";
import type { ModuleController } from "../controllers/module.controller.js";
import { createAuthRoutes } from "./auth.routes.js";
import { UserRoutes } from "./user.routes.js";
import { createModuleRoutes } from "./module.routes.js";
import { createCommentRoutes } from "./comment.routes.js";
import { createIssueRoutes } from "./issue.routes.js";
import { createProjectRoutes } from "./project.routes.js";
import type { UserPermissionRepository } from "../../../application/auth/ports/user-permission-repository.port.js";

export interface RouteControllers {
  auth: AuthController;
  users: UserController;
  modules: ModuleController;
  projects: ProjectController;
  issues: IssueController;
  comments: CommentController;
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
    "/projects",
    createProjectRoutes(controllers.projects, authenticate, permissions),
  );
  router.use(
    "/projects/:id/issues/:issueId/comments",
    createCommentRoutes(controllers.comments, authenticate, permissions),
  );
  router.use(
    "/projects/:id",
    createIssueRoutes(controllers.issues, authenticate, permissions),
  );
  router.use("/modules", createModuleRoutes(controllers.modules, authenticate));

  return router;
}