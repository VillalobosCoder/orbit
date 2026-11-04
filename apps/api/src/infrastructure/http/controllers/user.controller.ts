import type { Response } from "express";
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
import { actorId, type AuthedRequest } from "../middleware/auth.middleware.js";
import { GetUserUseCase } from "../../../application/user/use-cases/get-user.use-case.js";
import { UpdateUserUseCase } from "../../../application/user/use-cases/update-user.use-case.js";
import type { GetAvatarUseCase } from "../../../application/user/use-cases/get-avatar.use-case.js";
import { GetUserListUseCase } from "../../../application/user/use-cases/get-user-list.use-case.js";
import { sendError } from "../middleware/locale.middleware.js";

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
  ): Promise<void> => {
    const query: UserListQueryDto = listUsersQuerySchema.parse(req.query);
    const response: UserListResponseDto =
      await this.getUserListUseCase.execute(query);
    res.status(200).json(response);
  };

  getAvatar = async (
    req: AuthedRequest,
    res: Response,
  ): Promise<void> => {
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
  };

  create = async (
    req: AuthedRequest,
    res: Response,
  ): Promise<void> => {
    const actorUserId = actorId(req);

    const input: SaveUserRequestDto = saveSchema.parse(req.body);
    const result = await this.createUserUseCase.execute({
      ...input,
      actorUserId,
    });
    const response: CreateUserResponseDto = result;
    res.status(201).json(response);
  };

  getById = async (
    req: AuthedRequest,
    res: Response,
  ): Promise<void> => {
    const { id } = idParamSchema.parse(req.params);
    const response: UserDetailDto = await this.getUserUseCase.execute({ id });
    res.status(200).json(response);
  };

  update = async (
    req: AuthedRequest,
    res: Response,
  ): Promise<void> => {
    const actorUserId = actorId(req);

    const { id } = idParamSchema.parse(req.params);
    const input: SaveUserRequestDto = saveSchema.parse(req.body);

    if (id === actorUserId && input.permissions !== undefined) {
      sendError(res, 403, "errors.http.cannotEditOwnPermissions");
      return;
    }

    await this.updateUserUseCase.execute({ ...input, id, actorUserId });
    res.status(204).end();
  };

  resetPassword = async (
    req: AuthedRequest,
    res: Response,
  ): Promise<void> => {
    const actorUserId = actorId(req);

    const { id } = idParamSchema.parse(req.params);
    const response: ResetUserPasswordResponseDto =
      await this.resetUserPasswordUseCase.execute({ id, actorUserId });
    res.status(200).json(response);
  };

  delete = async (
    req: AuthedRequest,
    res: Response,
  ): Promise<void> => {
    const { id } = deleteSchema.parse(req.params);
    const authenticatedUserId = actorId(req);

    if (id === authenticatedUserId) {
      sendError(res, 403, "errors.http.cannotDeleteOwnAccount");
      return;
    }

    await this.deleteUserUseCase.execute({ id });
    res.status(204).end();
  };
}
