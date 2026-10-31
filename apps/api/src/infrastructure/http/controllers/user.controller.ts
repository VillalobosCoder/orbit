import type { NextFunction, Response } from "express";
import type {
  CreateUserResponseDto,
  ResetUserPasswordResponseDto,
  SaveUserRequestDto,
  UserDetailDto,
  UserListQueryDto,
  UserListResponseDto,
} from "@orbit/shared";
import type { ResetUserPasswordUseCase } from "../../../application/user/use-cases/reset-user-password.use-case.js";
import { CreateUserUseCase } from "../../../application/user/use-cases/create-user.use-case.js";
import {
  deleteSchema,
  idParamSchema,
  listUsersQuerySchema,
  saveSchema,
} from "../schemas/user.schema.js";
import { DeleteUserUseCase } from "../../../application/user/use-cases/delete-user.use-case.js";
import type { AuthedRequest } from "../middleware/auth.middleware.js";
import { GetUserUseCase } from "../../../application/user/use-cases/get-user.use-case.js";
import { UpdateUserUseCase } from "../../../application/user/use-cases/update-user.use-case.js";
import type { GetAvatarUseCase } from "../../../application/user/use-cases/get-avatar.use-case.js";
import { GetUserListUseCase } from "../../../application/user/use-cases/get-user-list.use-case.js";

export class UserController {
  constructor(
    private readonly getUserListUseCase: GetUserListUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly resetUserPasswordUseCase: ResetUserPasswordUseCase,
    private readonly getAvatarUseCase: GetAvatarUseCase,
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

      const query: UserListQueryDto = listUsersQuerySchema.parse(req.query);
      const response: UserListResponseDto =
        await this.getUserListUseCase.execute(query);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getAvatar = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const { content, mimeType } = await this.getAvatarUseCase.execute({ id });

      res
        .status(200)
        .type(mimeType)
        .set({
          "Cache-Control": "private, max-age=86400",
          "X-Content-Type-Options": "nosniff",
        })
        .send(content);
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
      const actorUserId = req.auth?.id;
      if (actorUserId === undefined) {
        res.status(401).json({ error: "No autenticado." });
        return;
      }

      const input: SaveUserRequestDto = saveSchema.parse(req.body);
      const result = await this.createUserUseCase.execute({
        ...input,
        actorUserId,
      });
      const response: CreateUserResponseDto = result;
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  getById = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const response: UserDetailDto = await this.getUserUseCase.execute({ id });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const actorUserId = req.auth?.id;
      if (actorUserId === undefined) {
        res.status(401).json({ error: "No autenticado." });
        return;
      }

      const { id } = idParamSchema.parse(req.params);
      const input: SaveUserRequestDto = saveSchema.parse(req.body);

      if (id === actorUserId && input.permissions !== undefined) {
        res
          .status(403)
          .json({ error: "No puedes modificar tus propios permisos." });
        return;
      }

      await this.updateUserUseCase.execute({ ...input, id, actorUserId });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const actorUserId = req.auth?.id;

      if (actorUserId === undefined) {
        res.status(401).json({ error: "No autenticado." });
        return;
      }

      const { id } = idParamSchema.parse(req.params);
      const response: ResetUserPasswordResponseDto =
        await this.resetUserPasswordUseCase.execute({ id, actorUserId });
      res.status(200).json(response);
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
