import { Router } from "express";
import type { RequestHandler } from "express";
import type { ModuleController } from "../controllers/module.controller.js";

export function createModuleRoutes(
  controller: ModuleController,
  authenticate: RequestHandler,
) {
  const router = Router();

  router.get("/", authenticate, controller.getAll);

  return router;
}
