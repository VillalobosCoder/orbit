import { describe, expect, it } from "vitest";
import { HOME_ASSIGNED_ISSUES_LIMIT, type HomeSummaryDto } from "@orbit/shared";
import type { HomeRepository } from "../../../src/application/home/ports/home-repository.port.js";
import { GetHomeSummaryUseCase } from "../../../src/application/home/use-cases/get-home-summary.use-case.js";
import { stub } from "../../support/stub.js";

describe("GetHomeSummaryUseCase", () => {
  it("asks for the summary of the acting user with the configured limit", async () => {
    const summary = { projects: 2 } as unknown as HomeSummaryDto;
    const home = stub<HomeRepository>({ getSummary: async () => summary });

    const result = await new GetHomeSummaryUseCase(home).execute({ actorUserId: 4 });

    expect(result).toBe(summary);
    expect(home.getSummary).toHaveBeenCalledWith({
      actorUserId: 4,
      assignedLimit: HOME_ASSIGNED_ISSUES_LIMIT,
    });
  });
});
