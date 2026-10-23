import type { NextFunction, Response } from "express";
import type {
  CreateUserRequestDto,
  CreateUserResponseDto,
} from "@orbit/shared";
import { CreateUserUseCase } from "../../../application/user/use-cases/create-user.use-case.js";
import { createSchema, deleteSchema } from "../schemas/user.schema.js";
import { DeleteUserUseCase } from "../../../application/user/use-cases/delete-user.use-case.js";
import type { AuthedRequest } from "../middleware/auth.middleware.js";
import { GetUserListUseCase } from "../../../application/user/use-cases/get-user-list.use-case.js";

export class UserController {
  constructor(
    private readonly getUserListUseCase: GetUserListUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  getAllUsers = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authenticatedUserId = req.auth?.id;
      if (authenticatedUserId === undefined) {
        res.status(401).json({ error: "No autenticado." });
        return;
      }

      const users = await this.getUserListUseCase.execute();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };

  create = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const createdByUserId = req.auth?.id;
      if (createdByUserId === undefined) {
        res.status(401).json({ error: "No autenticado." });
        return;
      }

      const input: CreateUserRequestDto = createSchema.parse(req.body);
      const result = await this.createUserUseCase.execute({
        ...input,
        createdByUserId,
      });
      const response: CreateUserResponseDto = result;
      res.status(201).json(response);
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

      if (id === authenticatedUserId) {
        res.status(403).json({ error: "No puedes eliminar tu propia cuenta." });
        return;
      }

      await this.deleteUserUseCase.execute({ id });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}
