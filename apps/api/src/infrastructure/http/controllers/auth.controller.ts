import type { Request, Response } from "express";
import type {
  ChangePasswordRequestDto,
  UpdateProfileRequestDto,
  LoginRequestDto,
  LoginResponseDto,
} from "@orbit/shared";
import type { LoginUseCase } from "../../../application/auth/use-cases/login.use-case.js";
import type { GetCurrentUserUseCase } from "../../../application/auth/use-cases/get-current-user.use-case.js";
import type { ChangePasswordUseCase } from "../../../application/auth/use-cases/change-password.use-case.js";
import type { UpdateProfileUseCase } from "../../../application/auth/use-cases/update-profile.use-case.js";
import type { UploadAvatarUseCase } from "../../../application/user/use-cases/upload-avatar.use-case.js";
import type { RemoveAvatarUseCase } from "../../../application/user/use-cases/remove-avatar.use-case.js";
import { InvalidAvatarImageError } from "../../../domain/user/user.errors.js";
import {
  changePasswordSchema,
  loginSchema,
  updateProfileSchema,
} from "../schemas/auth.schema.js";
import { actorId, type AuthedRequest } from "../middleware/auth.middleware.js";
import { sendError } from "../middleware/locale.middleware.js";
import {
  ACCESS_TOKEN_COOKIE,
  accessTokenCookieOptions,
  accessTokenSetOptions,
} from "../config/cookie.config.js";

export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly uploadAvatarUseCase: UploadAvatarUseCase,
    private readonly removeAvatarUseCase: RemoveAvatarUseCase,
  ) {}

  me = async (
    req: AuthedRequest,
    res: Response,
  ): Promise<void> => {
    const authenticatedUserId = actorId(req);

    const user = await this.getCurrentUserUseCase.execute(authenticatedUserId);

    if (!user) {
      sendError(res, 401, "errors.http.sessionInvalid");
      return;
    }

    const response: LoginResponseDto = { user };
    res.status(200).json(response);
  };

  updateProfile = async (
    req: AuthedRequest,
    res: Response,
  ): Promise<void> => {
    const actorUserId = actorId(req);

    const input: UpdateProfileRequestDto = updateProfileSchema.parse(
      req.body,
    );
    await this.updateProfileUseCase.execute({ ...input, actorUserId });
    const user = await this.getCurrentUserUseCase.execute(actorUserId);

    if (!user) {
      sendError(res, 401, "errors.http.sessionInvalid");
      return;
    }

    const response: LoginResponseDto = { user };
    res.status(200).json(response);
  };

  uploadAvatar = async (
    req: AuthedRequest,
    res: Response,
  ): Promise<void> => {
    const actorUserId = actorId(req);

    if (!Buffer.isBuffer(req.body)) {
      throw new InvalidAvatarImageError();
    }

    await this.uploadAvatarUseCase.execute({
      actorUserId,
      content: req.body,
    });
    const user = await this.getCurrentUserUseCase.execute(actorUserId);

    if (!user) {
      sendError(res, 401, "errors.http.sessionInvalid");
      return;
    }

    const response: LoginResponseDto = { user };
    res.status(200).json(response);
  };

  removeAvatar = async (
    req: AuthedRequest,
    res: Response,
  ): Promise<void> => {
    const actorUserId = actorId(req);

    await this.removeAvatarUseCase.execute({ actorUserId });
    const user = await this.getCurrentUserUseCase.execute(actorUserId);

    if (!user) {
      sendError(res, 401, "errors.http.sessionInvalid");
      return;
    }

    const response: LoginResponseDto = { user };
    res.status(200).json(response);
  };

  login = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const input: LoginRequestDto = loginSchema.parse(req.body);
    const result = await this.loginUseCase.execute(input);

    res.cookie(ACCESS_TOKEN_COOKIE, result.token, accessTokenSetOptions);

    const response: LoginResponseDto = { user: result.user };
    res.status(200).json(response);
  };

  changePassword = async (
    req: AuthedRequest,
    res: Response,
  ): Promise<void> => {
    const userId = actorId(req);

    const input: ChangePasswordRequestDto = changePasswordSchema.parse(
      req.body,
    );
    const { token } = await this.changePasswordUseCase.execute({
      ...input,
      userId,
    });
    const user = await this.getCurrentUserUseCase.execute(userId);

    if (!user) {
      sendError(res, 401, "errors.http.sessionInvalid");
      return;
    }

    res.cookie(ACCESS_TOKEN_COOKIE, token, accessTokenSetOptions);

    const response: LoginResponseDto = { user };
    res.status(200).json(response);
  };

  logout = (_req: Request, res: Response): void => {
    res.clearCookie(ACCESS_TOKEN_COOKIE, accessTokenCookieOptions);
    
    res.status(204).end();
  };
}
