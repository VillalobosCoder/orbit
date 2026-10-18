import { Router } from "express";
import type { RequestHandler } from "express";
import type { AuthController } from "../controllers/auth.controller.js";
import type { UserController } from "../controllers/user.controller.js";
import { createAuthRoutes } from "./auth.routes.js";
import { createUserRoutes } from "./user.routes.js";

export interface RouteControllers {
  auth: AuthController;
  users: UserController;
}

export function createApiRoutes(
  controllers: RouteControllers,
  authenticate: RequestHandler,
) {
  const router = Router();

  router.use("/auth", createAuthRoutes(controllers.auth, authenticate));
  router.use("/users", createUserRoutes(controllers.users, authenticate));

  return router;
}