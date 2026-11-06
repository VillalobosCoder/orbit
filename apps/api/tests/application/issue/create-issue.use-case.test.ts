import { describe, expect, it } from "vitest";
import { CreateIssueUseCase } from "../../../src/application/issue/use-cases/create-issue.use-case.js";
import {
  InvalidIssueAssigneeError,
  InvalidIssueDatesError,
  InvalidIssueParentError,
  InvalidIssueReferenceError,
} from "../../../src/domain/issue/issue.errors.js";
import { InvalidSprintStateError } from "../../../src/domain/sprint/sprint.errors.js";
import { ProjectNotFoundError } from "../../../src/domain/project/project.errors.js";
import { SprintStatus } from "@orbit/shared";
import { transactionDouble } from "../../support/doubles.js";
import { aSprint, anIssue } from "../../support/fixtures.js";
import {
  catalogDouble,
  issuesDouble,
  membersDouble,
  notificationsDouble,
  projectsDouble,
  sprintsDouble,
} from "../../support/issue-ports.js";

function setup({ isMember = true, sprint = aSprint(), parent = anIssue({ id: 50, sprintId: 5 }) } = {}) {
  const projects = projectsDouble(isMember);
  const sprints = sprintsDouble(sprint);
  const issues = issuesDouble(parent);
  const notifications = notificationsDouble();

  return {
    projects,
    sprints,
    issues,
    notifications,
    useCase: new CreateIssueUseCase(
      projects,
      sprints,
      membersDouble(),
      issues,
      catalogDouble(),
      notifications,
      transactionDouble(),
    ),
  };
}

const input = { id: 10, title: "  Build it ", typeId: 1, actorUserId: 1 };

describe("CreateIssueUseCase", () => {
  it("creates the issue in the first todo column, reported by the actor", async () => {
    const { useCase, issues } = setup();

    const result = await useCase.execute(input);

    expect(result).toMatchObject({
      id: 100,
      issueKey: "WEB-8",
      title: "Build it",
      columnId: 1,
      reporterId: 1,
      resolvedAt: null,
    });
    const [saved] = issues.save.mock.calls[0]!;
    expect(saved.issueNumber).toBe(8);
  });

  it("puts the new issue after the last one in its column", async () => {
    const { useCase, issues } = setup();
    issues.findLastBoardPosition.mockResolvedValue(3000);

    const result = await useCase.execute(input);

    expect(result.boardPosition).toBeGreaterThan(3000);
  });

  it("creates it already resolved when placed in a done column", async () => {
    const { useCase } = setup();

    const result = await useCase.execute({ ...input, columnId: 3 });

    expect(result.columnId).toBe(3);
    expect(result.resolvedAt).not.toBeNull();
  });

  it("stores assignees once and notifies them", async () => {
    const { useCase, issues, notifications } = setup();

    await useCase.execute({ ...input, assigneeIds: [2, 2, 3] });

    expect(issues.replaceAssignees).toHaveBeenCalledWith({
      issueId: 100,
      userIds: [2, 3],
      actorUserId: 1,
    });
    expect(notifications.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientIds: [2, 3],
        actorUserId: 1,
        type: "issue_assigned",
        entityId: 100,
        payload: expect.objectContaining({ issueKey: "WEB-8", projectId: 10 }),
      }),
    );
  });

  it("rejects assignees who are not project members", async () => {
    const { useCase, issues } = setup();

    await expect(useCase.execute({ ...input, assigneeIds: [42] })).rejects.toThrow(
      InvalidIssueAssigneeError,
    );
    expect(issues.save).not.toHaveBeenCalled();
  });

  it("rejects ids from another project's catalog", async () => {
    const { useCase } = setup();

    await expect(useCase.execute({ ...input, typeId: 99 })).rejects.toThrow(InvalidIssueReferenceError);
    await expect(useCase.execute({ ...input, priorityId: 99 })).rejects.toThrow(InvalidIssueReferenceError);
    await expect(useCase.execute({ ...input, difficultyId: 99 })).rejects.toThrow(InvalidIssueReferenceError);
    await expect(useCase.execute({ ...input, columnId: 99 })).rejects.toThrow(InvalidIssueReferenceError);
  });

  it("rejects a start date after the due date", async () => {
    const { useCase } = setup();

    await expect(
      useCase.execute({ ...input, startDate: "2026-12-01", dueDate: "2026-11-01" }),
    ).rejects.toThrow(InvalidIssueDatesError);
  });

  it("answers not found to people outside the project", async () => {
    const { useCase, issues } = setup({ isMember: false });

    await expect(useCase.execute(input)).rejects.toThrow(ProjectNotFoundError);
    expect(issues.save).not.toHaveBeenCalled();
  });

  describe("sprints", () => {
    it("assigns the chosen sprint", async () => {
      const { useCase } = setup();

      const result = await useCase.execute({ ...input, sprintId: 5 });

      expect(result.sprintId).toBe(5);
    });

    it("rejects a sprint that does not exist in the project", async () => {
      const { useCase } = setup({ sprint: null as never });

      await expect(useCase.execute({ ...input, sprintId: 5 })).rejects.toThrow(
        InvalidIssueReferenceError,
      );
    });

    it("rejects a closed sprint", async () => {
      const { useCase } = setup({ sprint: aSprint({ status: SprintStatus.CLOSED }) });

      await expect(useCase.execute({ ...input, sprintId: 5 })).rejects.toThrow(
        InvalidSprintStateError,
      );
    });
  });

  describe("subtasks", () => {
    const subtask = { ...input, typeId: 2, parentId: 50 };

    it("inherits the sprint of the parent, ignoring the one sent", async () => {
      const { useCase } = setup({ parent: anIssue({ id: 50, sprintId: 5 }) });

      const result = await useCase.execute({ ...subtask, sprintId: 99 });

      expect(result.sprintId).toBe(5);
      expect(result.parentId).toBe(50);
    });

    it("requires a parent", async () => {
      const { useCase } = setup();

      await expect(useCase.execute({ ...input, typeId: 2 })).rejects.toThrow(
        InvalidIssueParentError,
      );
    });
  });
});
