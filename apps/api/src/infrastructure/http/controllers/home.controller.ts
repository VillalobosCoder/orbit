import type { NextFunction, Response } from "express";
import type { HomeSummaryDto } from "@orbit/shared";
import type { GetHomeSummaryUseCase } from "../../../application/home/use-cases/get-home-summary.use-case.js";
import type { AuthedRequest } from "../middleware/auth.middleware.js";
import { sendError } from "../middleware/locale.middleware.js";

export class HomeController {
  constructor(private readonly getHomeSummaryUseCase: GetHomeSummaryUseCase) {}

  getSummary = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const actorUserId = req.auth?.id;

      if (actorUserId === undefined) {
        sendError(res, 401, "errors.http.notAuthenticated");
        return;
      }

      const response: HomeSummaryDto = await this.getHomeSummaryUseCase.execute({
        actorUserId,
      });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
