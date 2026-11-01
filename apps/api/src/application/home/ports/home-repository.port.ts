import type { HomeSummaryDto } from "@orbit/shared";
import type { Actor } from "../../shared/actor.js";

export type GetHomeSummaryQuery = Actor & {
  assignedLimit: number;
};

export interface HomeRepository {
  getSummary(query: GetHomeSummaryQuery): Promise<HomeSummaryDto>;
}
