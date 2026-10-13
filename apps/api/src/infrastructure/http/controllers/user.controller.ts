import type { NextFunction, Request, Response } from "express";
import { CreateUserUseCase } from "../../../application/user/use-cases/create-user.use-case.js";
import { createSchema, deleteSchema } from "../schemas/user.schema.js";
import { DeleteUserUseCase } from "../../../application/user/use-cases/delete-user.use-case.js";
import type { AuthedRequest } from "../middleware/auth.middleware.js";

export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const input = createSchema.parse(req.body);
      await this.createUserUseCase.execute(input);
      res.status(201).end();
    } catch (error) {
      next(error);
    }
  };

  delete = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = deleteSchema.parse(req.params);
      const authenticatedUserId = req.auth?.id;

      if (authenticatedUserId === undefined) {
        res.status(401).json({ error: "No autenticado." });
        return;
      }

      if (id !== authenticatedUserId) {
        res.status(403).json({ error: "No puedes eliminar esta cuenta." });
        return;
      }

      await this.deleteUserUseCase.execute({ id });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}
