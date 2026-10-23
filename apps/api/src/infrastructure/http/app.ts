import cookieParser from "cookie-parser";
import express from "express";
import type { TokenService } from "../../application/auth/ports/token-service.port.js";
import type { RouteControllers } from "./routes/index.js";
import { createApiRoutes } from "./routes/index.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";
import { makeAuthMiddleware } from "./middleware/auth.middleware.js";
import type { UserPermissionRepository } from "../../application/auth/ports/user-permission-repository.port.js";

export function createHttpApp(
  controllers: RouteControllers,
  tokenService: TokenService,
  userPermissionRepository: UserPermissionRepository,
) {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "16kb" }));
  app.use(cookieParser());
  app.use("/api", createApiRoutes(
    controllers,
    makeAuthMiddleware(tokenService),
    userPermissionRepository,
  ));
  app.use(errorHandler);

  return app;
}
