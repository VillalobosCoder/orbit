import type { NextFunction, Request, Response } from "express";
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
import {
  changePasswordSchema,
  loginSchema,
  updateProfileSchema,
} from "../schemas/auth.schema.js";
import type { AuthedRequest } from "../middleware/auth.middleware.js";

const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;
const isProduction = process.env.NODE_ENV === "production";

const accessTokenCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict" as const,
  path: "/",
};

export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
  ) {}

  me = async (
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

      const user = await this.getCurrentUserUseCase.execute(authenticatedUserId);

      if (!user) {
        res.status(401).json({ error: "La sesión ya no es válida." });
        return;
      }

      const response: LoginResponseDto = { user };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (
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

      const input: UpdateProfileRequestDto = updateProfileSchema.parse(
        req.body,
      );
      await this.updateProfileUseCase.execute({ ...input, actorUserId });
      const user = await this.getCurrentUserUseCase.execute(actorUserId);

      if (!user) {
        res.status(401).json({ error: "La sesión ya no es válida." });
        return;
      }

      const response: LoginResponseDto = { user };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const input: LoginRequestDto = loginSchema.parse(req.body);
      const result = await this.loginUseCase.execute(input);

      res.cookie("access_token", result.token, {
        ...accessTokenCookieOptions,
        maxAge: ACCESS_TOKEN_MAX_AGE_MS,
      });

      const response: LoginResponseDto = { user: result.user };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.auth?.id;

      if (userId === undefined) {
        res.status(401).json({ error: "No autenticado." });
        return;
      }

      const input: ChangePasswordRequestDto = changePasswordSchema.parse(
        req.body,
      );
      const { token } = await this.changePasswordUseCase.execute({
        ...input,
        userId,
      });
      const user = await this.getCurrentUserUseCase.execute(userId);

      if (!user) {
        res.status(401).json({ error: "La sesión ya no es válida." });
        return;
      }

      res.cookie("access_token", token, {
        ...accessTokenCookieOptions,
        maxAge: ACCESS_TOKEN_MAX_AGE_MS,
      });

      const response: LoginResponseDto = { user };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  logout = (_req: Request, res: Response): void => {
    res.clearCookie("access_token", accessTokenCookieOptions);
    
    res.status(204).end();
  };
}
