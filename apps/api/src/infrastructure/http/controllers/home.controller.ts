import type { Response } from "express";
import type { HomeSummaryDto } from "@orbit/shared";
import type { GetHomeSummaryUseCase } from "../../../application/home/use-cases/get-home-summary.use-case.js";
import { actorId, type AuthedRequest } from "../middleware/auth.middleware.js";

export class HomeController {
  constructor(private readonly getHomeSummaryUseCase: GetHomeSummaryUseCase) {}

  getSummary = async (
    req: AuthedRequest,
    res: Response,
  ): Promise<void> => {
    const actorUserId = actorId(req);

    const response: HomeSummaryDto = await this.getHomeSummaryUseCase.execute({
      actorUserId,
    });
    res.status(200).json(response);
  };
}
