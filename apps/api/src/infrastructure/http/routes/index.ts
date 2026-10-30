import { Router } from "express";
import type { RequestHandler } from "express";
import type { AuthController } from "../controllers/auth.controller.js";
import type { UserController } from "../controllers/user.controller.js";
import type { CommentController } from "../controllers/comment.controller.js";
import type { SprintController } from "../controllers/sprint.controller.js";
import type { BoardColumnController } from "../controllers/board-column.controller.js";
import type { IssueController } from "../controllers/issue.controller.js";
import type { ProjectController } from "../controllers/project.controller.js";
import type { ModuleController } from "../controllers/module.controller.js";
import { createAuthRoutes } from "./auth.routes.js";
import { UserRoutes } from "./user.routes.js";
import { createModuleRoutes } from "./module.routes.js";
import { createCommentRoutes } from "./comment.routes.js";
import { createBoardColumnRoutes } from "./board-column.routes.js";
import { createIssueRoutes } from "./issue.routes.js";
import { createSprintRoutes } from "./sprint.routes.js";
import { createProjectRoutes } from "./project.routes.js";
import type { UserPermissionRepository } from "../../../application/auth/ports/user-permission-repository.port.js";
import { requirePasswordChanged } from "../middleware/auth.middleware.js";

export interface RouteControllers {
  auth: AuthController;
  users: UserController;
  modules: ModuleController;
  projects: ProjectController;
  issues: IssueController;
  comments: CommentController;
  sprints: SprintController;
  boardColumns: BoardColumnController;
}

export function createApiRoutes(
  controllers: RouteControllers,
  authenticate: RequestHandler,
  permissions: UserPermissionRepository,
) {
  const router = Router();
  const authenticateReady = requirePasswordChanged(authenticate);

  router.use("/auth", createAuthRoutes(controllers.auth, authenticate));
  router.use(
    "/users",
    UserRoutes(controllers.users, authenticateReady, permissions),
  );
  router.use(
    "/projects",
    createProjectRoutes(controllers.projects, authenticateReady, permissions),
  );
  router.use(
    "/projects/:id/issues/:issueId/comments",
    createCommentRoutes(controllers.comments, authenticateReady, permissions),
  );
  router.use(
    "/projects/:id",
    createIssueRoutes(controllers.issues, authenticateReady, permissions),
  );
  router.use(
    "/projects/:id",
    createSprintRoutes(controllers.sprints, authenticateReady, permissions),
  );
  router.use(
    "/projects/:id/columns",
    createBoardColumnRoutes(
      controllers.boardColumns,
      authenticateReady,
      permissions,
    ),
  );
  router.use(
    "/modules",
    createModuleRoutes(controllers.modules, authenticateReady),
  );

  return router;
}