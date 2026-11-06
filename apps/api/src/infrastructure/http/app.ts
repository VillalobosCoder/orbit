import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import type { TokenService } from "../../application/auth/ports/token-service.port.js";
import type { RouteControllers } from "./routes/index.js";
import { createApiRoutes } from "./routes/index.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";
import { makeLocaleMiddleware } from "./middleware/locale.middleware.js";
import { makeAuthMiddleware } from "./middleware/auth.middleware.js";
import type { SessionRepository } from "../../application/auth/ports/session-repository.port.js";
import type { UserRepository } from "../../application/user/ports/user-repository.port.js";
import type { UserPermissionRepository } from "../../application/auth/ports/user-permission-repository.port.js";

export function createHttpApp(
  controllers: RouteControllers,
  tokenService: TokenService,
  userPermissionRepository: UserPermissionRepository,
  userRepository: UserRepository,
  sessionRepository: SessionRepository,
  trustProxy: number,
) {
  const app = express();

  app.disable("x-powered-by");

  if (trustProxy > 0) {
    app.set("trust proxy", trustProxy);
  }

  app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));
  app.use((_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  app.use(makeLocaleMiddleware());
  app.use(express.json({ limit: "16kb" }));
  app.use(cookieParser());
  app.use("/api", createApiRoutes(
    controllers,
    makeAuthMiddleware(tokenService, userRepository, sessionRepository),
    userPermissionRepository,
  ));
  app.use(errorHandler);

  return app;
}
