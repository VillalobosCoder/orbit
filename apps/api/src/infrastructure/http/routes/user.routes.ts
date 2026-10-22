import { Router } from "express";
import type { RequestHandler } from "express";
import type { UserController } from "../controllers/user.controller.js";

export function createUserRoutes(
  controller: UserController,
  authenticate: RequestHandler,
) {
  const router = Router();

  router.get("/", authenticate, controller.getAllUsers);
  router.post("/", controller.create);
  router.delete("/:id", authenticate, controller.delete);

  return router;
}