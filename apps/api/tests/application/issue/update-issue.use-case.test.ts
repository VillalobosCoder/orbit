import { describe, expect, it } from "vitest";
import { SprintStatus } from "@orbit/shared";
import { UpdateIssueUseCase } from "../../../src/application/issue/use-cases/update-issue.use-case.js";
import {
  InvalidIssueAssigneeError,
  InvalidIssueParentError,
  IssueActionNotAllowedError,
  IssueNotFoundError,
} from "../../../src/domain/issue/issue.errors.js";
import { ProjectNotFoundError } from "../../../src/domain/project/project.errors.js";
import { InvalidSprintStateError } from "../../../src/domain/sprint/sprint.errors.js";
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

function setup({
  existing = anIssue({ assigneeIds: [1] }),
  isMember = true,
  sprint = aSprint(),
}: { existing?: ReturnType<typeof anIssue> | null; isMember?: boolean; sprint?: ReturnType<typeof aSprint> } = {}) {
  const issues = issuesDouble();
  issues.findById.mockImplementation(async ({ issueId }) =>
    existing && issueId === existing.id ? existing : issueId === 50 ? anIssue({ id: 50, sprintId: 5 }) : null,
  );
  const notifications = notificationsDouble();
  const sprints = sprintsDouble(sprint);

  return {
    issues,
    notifications,
    useCase: new UpdateIssueUseCase(
      projectsDouble(isMember),
      sprints,
      membersDouble(),
      issues,
      catalogDouble(),
      notifications,
      transactionDouble(),
    ),
  };
}

const input = {
  id: 10,
  issueId: 100,
  title: "  Renamed ",
  typeId: 1,
  actorUserId: 1,
  canMoveIssues: true,
  canAssignSprints: true,
};

describe("UpdateIssueUseCase", () => {
  it("updates the editable fields and records the actor", async () => {
    const { useCase, issues } = setup();

    await useCase.execute({ ...input, priorityId: 1, storyPoints: 5, dueDate: "2026-12-01" });

    const [saved, actor] = issues.update.mock.calls[0]!;
    expect(saved).toMatchObject({
      id: 100,
      title: "Renamed",
      priorityId: 1,
      storyPoints: 5,
      dueDate: "2026-12-01",
    });
    expect(actor).toBe(1);
  });

  it("fails when the issue is not in the project", async () => {
    const { useCase } = setup({ existing: null });

    await expect(useCase.execute(input)).rejects.toThrow(IssueNotFoundError);
  });

  it("answers not found to people outside the project", async () => {
    const { useCase, issues } = setup({ isMember: false });

    await expect(useCase.execute(input)).rejects.toThrow(ProjectNotFoundError);
    expect(issues.update).not.toHaveBeenCalled();
  });

  describe("permissions", () => {
    it("blocks a column change without the move permission", async () => {
      const { useCase, issues } = setup();

      await expect(
        useCase.execute({ ...input, columnId: 2, canMoveIssues: false }),
      ).rejects.toThrow(IssueActionNotAllowedError);
      expect(issues.update).not.toHaveBeenCalled();
    });

    it("allows resending the current column without the move permission", async () => {
      const { useCase } = setup();

      await expect(
        useCase.execute({ ...input, columnId: 1, canMoveIssues: false }),
      ).resolves.toBeUndefined();
    });

    it("blocks a sprint change without the sprint permission", async () => {
      const { useCase, issues } = setup();

      await expect(
        useCase.execute({ ...input, sprintId: 5, canAssignSprints: false }),
      ).rejects.toThrow(IssueActionNotAllowedError);
      expect(issues.update).not.toHaveBeenCalled();
    });
  });

  describe("moving between columns", () => {
    it("moves it to the end of the new column", async () => {
      const { useCase, issues } = setup();
      issues.findLastBoardPosition.mockResolvedValue(5000);

      await useCase.execute({ ...input, columnId: 2 });

      const [saved] = issues.update.mock.calls[0]!;
      expect(saved.columnId).toBe(2);
      expect(saved.boardPosition).toBeGreaterThan(5000);
    });

    it("resolves the issue when it enters a done column", async () => {
      const { useCase, issues } = setup();

      await useCase.execute({ ...input, columnId: 3 });

      const [saved] = issues.update.mock.calls[0]!;
      expect(saved.resolvedAt).toBeInstanceOf(Date);
    });
  });

  describe("sprints", () => {
    it("changes the sprint and moves its subtasks along", async () => {
      const { useCase, issues } = setup();

      await useCase.execute({ ...input, sprintId: 5 });

      expect(issues.setChildrenSprint).toHaveBeenCalledWith({
        id: 10,
        issueId: 100,
        sprintId: 5,
        actorUserId: 1,
      });
    });

    it("does not touch subtasks when the sprint is unchanged", async () => {
      const { useCase, issues } = setup();

      await useCase.execute({ ...input });

      expect(issues.setChildrenSprint).not.toHaveBeenCalled();
    });

    it("rejects moving it to a closed sprint", async () => {
      const { useCase } = setup({ sprint: aSprint({ status: SprintStatus.CLOSED }) });

      await expect(useCase.execute({ ...input, sprintId: 5 })).rejects.toThrow(
        InvalidSprintStateError,
      );
    });
  });

  describe("subtasks", () => {
    it("cannot become a subtask while it has subtasks of its own", async () => {
      const { useCase, issues } = setup();
      issues.hasChildren.mockResolvedValue(true);

      await expect(
        useCase.execute({ ...input, typeId: 2, parentId: 50 }),
      ).rejects.toThrow(InvalidIssueParentError);
    });

    it("cannot be its own parent", async () => {
      const { useCase } = setup();

      await expect(
        useCase.execute({ ...input, typeId: 2, parentId: 100 }),
      ).rejects.toThrow(InvalidIssueParentError);
    });
  });

  describe("assignees", () => {
    it("notifies only the people who were just added", async () => {
      const { useCase, issues, notifications } = setup({ existing: anIssue({ assigneeIds: [1] }) });

      await useCase.execute({ ...input, assigneeIds: [1, 2, 3] });

      expect(issues.replaceAssignees).toHaveBeenCalledWith({
        issueId: 100,
        userIds: [1, 2, 3],
        actorUserId: 1,
      });
      expect(notifications.notify).toHaveBeenCalledWith(
        expect.objectContaining({ recipientIds: [2, 3], type: "issue_assigned" }),
      );
    });

    it("leaves assignees untouched when none are sent", async () => {
      const { useCase, issues, notifications } = setup();

      await useCase.execute(input);

      expect(issues.replaceAssignees).not.toHaveBeenCalled();
      expect(notifications.notify).not.toHaveBeenCalled();
    });

    it("can clear every assignee", async () => {
      const { useCase, issues } = setup();

      await useCase.execute({ ...input, assigneeIds: [] });

      expect(issues.replaceAssignees).toHaveBeenCalledWith(
        expect.objectContaining({ userIds: [] }),
      );
    });

    it("rejects people who are not members", async () => {
      const { useCase, issues } = setup();

      await expect(useCase.execute({ ...input, assigneeIds: [42] })).rejects.toThrow(
        InvalidIssueAssigneeError,
      );
      expect(issues.update).not.toHaveBeenCalled();
    });
  });

  describe("due date notifications", () => {
    it("recalculates the due date alerts when the due date changes", async () => {
      const { useCase, notifications } = setup({ existing: anIssue({ dueDate: "2026-11-01" }) });

      await useCase.execute({ ...input, dueDate: "2026-12-01" });

      expect(notifications.deleteDueForIssue).toHaveBeenCalledWith(100);
    });

    it("recalculates them when the due date is removed", async () => {
      const { useCase, notifications } = setup({ existing: anIssue({ dueDate: "2026-11-01" }) });

      await useCase.execute({ ...input, dueDate: null });

      expect(notifications.deleteDueForIssue).toHaveBeenCalledWith(100);
    });

    it("keeps the alerts when the due date is the same", async () => {
      const { useCase, notifications } = setup({ existing: anIssue({ dueDate: "2026-11-01" }) });

      await useCase.execute({ ...input, dueDate: "2026-11-01" });

      expect(notifications.deleteDueForIssue).not.toHaveBeenCalled();
    });
  });
});
