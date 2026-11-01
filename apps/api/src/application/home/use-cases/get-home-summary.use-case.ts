import {
  HOME_ASSIGNED_ISSUES_LIMIT,
  type HomeSummaryDto,
} from "@orbit/shared";
import type { Actor } from "../../shared/actor.js";
import type { HomeRepository } from "../ports/home-repository.port.js";

export type GetHomeSummaryInput = Actor;

export class GetHomeSummaryUseCase {
  constructor(private readonly home: HomeRepository) {}

  execute({ actorUserId }: GetHomeSummaryInput): Promise<HomeSummaryDto> {
    return this.home.getSummary({
      actorUserId,
      assignedLimit: HOME_ASSIGNED_ISSUES_LIMIT,
    });
  }
}
