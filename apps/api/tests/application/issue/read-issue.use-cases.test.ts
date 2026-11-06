import { describe, expect, it } from "vitest";
import { DeleteIssueUseCase } from "../../../src/application/issue/use-cases/delete-issue.use-case.js";
import { GetBoardUseCase } from "../../../src/application/issue/use-cases/get-board.use-case.js";
import { GetIssueOptionsUseCase } from "../../../src/application/issue/use-cases/get-issue-options.use-case.js";
import { GetIssueUseCase } from "../../../src/application/issue/use-cases/get-issue.use-case.js";
import { IssueNotFoundError } from "../../../src/domain/issue/issue.errors.js";
import { ProjectNotFoundError } from "../../../src/domain/project/project.errors.js";
import { SprintStatus } from "@orbit/shared";
import { transactionDouble } from "../../support/doubles.js";
import { aSprint, anIssue, columns, difficulties, issueTypes, priorities } from "../../support/fixtures.js";
import { catalogDouble, issuesDouble, projectsDouble } from "../../support/issue-ports.js";
import type { SprintRepository } from "../../../src/application/sprint/ports/sprint-repository.port.js";
import { stub } from "../../support/stub.js";

describe("GetIssueUseCase", () => {
  it("returns the issue with its readable key", async () => {
    const result = await new GetIssueUseCase(projectsDouble(), issuesDouble()).execute({
      id: 10,
      issueId: 100,
      actorUserId: 1,
    });

    expect(result).toMatchObject({ id: 100, issueKey: "WEB-7", title: "Fix login" });
  });

  it("fails when the issue does not exist", async () => {
    const issues = issuesDouble();
    issues.findById.mockResolvedValue(null);

    await expect(
      new GetIssueUseCase(projectsDouble(), issues).execute({ id: 10, issueId: 1, actorUserId: 1 }),
    ).rejects.toThrow(IssueNotFoundError);
  });

  it("answers not found to people outside the project", async () => {
    await expect(
      new GetIssueUseCase(projectsDouble(false), issuesDouble()).execute({
        id: 10,
        issueId: 100,
        actorUserId: 9,
      }),
    ).rejects.toThrow(ProjectNotFoundError);
  });
});

describe("GetIssueOptionsUseCase", () => {
  it("returns the types, priorities and difficulties", async () => {
    const result = await new GetIssueOptionsUseCase(projectsDouble(), catalogDouble()).execute({
      id: 10,
      actorUserId: 1,
    });

    expect(result).toEqual({ issueTypes, priorities, difficulties });
  });

  it("answers not found to people outside the project", async () => {
    await expect(
      new GetIssueOptionsUseCase(projectsDouble(false), catalogDouble()).execute({
        id: 10,
        actorUserId: 9,
      }),
    ).rejects.toThrow(ProjectNotFoundError);
  });
});

describe("GetBoardUseCase", () => {
  it("shows the active sprint and only its issues", async () => {
    const sprints = stub<SprintRepository>({
      findActive: async () => aSprint({ status: SprintStatus.ACTIVE }),
    });
    const issues = issuesDouble();
    issues.findAllByProject.mockResolvedValue([anIssue()]);

    const result = await new GetBoardUseCase(
      projectsDouble(),
      sprints,
      issues,
      catalogDouble(),
    ).execute({ id: 10, actorUserId: 1 });

    expect(issues.findAllByProject).toHaveBeenCalledWith({ id: 10, sprintId: 5 });
    expect(result.activeSprint).toMatchObject({ id: 5, status: SprintStatus.ACTIVE });
    expect(result.columns).toEqual(columns);
    expect(result.issues[0]?.issueKey).toBe("WEB-7");
  });

  it("falls back to the backlog when no sprint is active", async () => {
    const sprints = stub<SprintRepository>({ findActive: async () => null });
    const issues = issuesDouble();
    issues.findAllByProject.mockResolvedValue([]);

    const result = await new GetBoardUseCase(
      projectsDouble(),
      sprints,
      issues,
      catalogDouble(),
    ).execute({ id: 10, actorUserId: 1 });

    expect(issues.findAllByProject).toHaveBeenCalledWith({ id: 10, sprintId: null });
    expect(result.activeSprint).toBeNull();
  });

  it("answers not found to people outside the project", async () => {
    await expect(
      new GetBoardUseCase(
        projectsDouble(false),
        stub<SprintRepository>({}),
        issuesDouble(),
        catalogDouble(),
      ).execute({ id: 10, actorUserId: 9 }),
    ).rejects.toThrow(ProjectNotFoundError);
  });
});

describe("DeleteIssueUseCase", () => {
  it("deletes the issue on behalf of the actor", async () => {
    const issues = issuesDouble();

    await new DeleteIssueUseCase(projectsDouble(), issues, transactionDouble()).execute({
      id: 10,
      issueId: 100,
      actorUserId: 1,
    });

    expect(issues.delete).toHaveBeenCalledWith({ id: 10, issueId: 100, actorUserId: 1 });
  });

  it("does not delete for people outside the project", async () => {
    const issues = issuesDouble();

    await expect(
      new DeleteIssueUseCase(projectsDouble(false), issues, transactionDouble()).execute({
        id: 10,
        issueId: 100,
        actorUserId: 9,
      }),
    ).rejects.toThrow(ProjectNotFoundError);
    expect(issues.delete).not.toHaveBeenCalled();
  });
});
