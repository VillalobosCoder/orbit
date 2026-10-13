import { Router } from "express";
import type { AuthController } from "../controllers/auth.controller.js";

export function createAuthRoutes(controller: AuthController) {
  const router = Router();

  router.post("/login", controller.login);
  router.post("/logout", controller.logout);

  return router;
}