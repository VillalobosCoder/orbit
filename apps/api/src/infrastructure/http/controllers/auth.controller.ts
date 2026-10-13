import type { NextFunction, Request, Response } from "express";
import type { LoginUseCase } from "../../../application/auth/use-cases/login.use-case.js";
import { loginSchema } from "../schemas/auth.schema.js";

const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;

const accessTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const input = loginSchema.parse(req.body);
      const result = await this.loginUseCase.execute(input);

      res.cookie("access_token", result.token, {
        ...accessTokenCookieOptions,
        maxAge: ACCESS_TOKEN_MAX_AGE_MS,
      });

      res.status(200).json({ user: result.user });
    } catch (error) {
      next(error);
    }
  };

  logout = (_req: Request, res: Response): void => {
    res.clearCookie("access_token", accessTokenCookieOptions);
    
    res.status(204).end();
  };
}
