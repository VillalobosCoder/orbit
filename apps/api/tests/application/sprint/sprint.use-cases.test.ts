import { describe, expect, it } from "vitest";
import { SprintStatus } from "@orbit/shared";
import type { SprintRepository } from "../../../src/application/sprint/ports/sprint-repository.port.js";
import { AssignIssueSprintUseCase } from "../../../src/application/sprint/use-cases/assign-issue-sprint.use-case.js";
import { CloseSprintUseCase } from "../../../src/application/sprint/use-cases/close-sprint.use-case.js";
import { CreateSprintUseCase } from "../../../src/application/sprint/use-cases/create-sprint.use-case.js";
import { DeleteSprintUseCase } from "../../../src/application/sprint/use-cases/delete-sprint.use-case.js";
import { GetPlanningUseCase } from "../../../src/application/sprint/use-cases/get-planning.use-case.js";
import { StartSprintUseCase } from "../../../src/application/sprint/use-cases/start-sprint.use-case.js";
import { UpdateSprintUseCase } from "../../../src/application/sprint/use-cases/update-sprint.use-case.js";
import {
  InvalidIssueParentError,
  InvalidIssueReferenceError,
  IssueNotFoundError,
} from "../../../src/domain/issue/issue.errors.js";
import { ProjectNotFoundError } from "../../../src/domain/project/project.errors.js";
import {
  ActiveSprintAlreadyExistsError,
  InvalidSprintDatesError,
  InvalidSprintStateError,
  SprintNotFoundError,
} from "../../../src/domain/sprint/sprint.errors.js";
import { transactionDouble } from "../../support/doubles.js";
import { aSprint, anIssue, columns } from "../../support/fixtures.js";
import { catalogDouble, issuesDouble, projectsDouble } from "../../support/issue-ports.js";
import { stub } from "../../support/stub.js";

function sprintsDouble(sprint: ReturnType<typeof aSprint> | null = aSprint()) {
  return stub<SprintRepository>({
    findById: async () => sprint,
    findActive: async () => null,
    findAllByProject: async () => (sprint ? [sprint] : []),
    save: async () => 5,
    update: async () => undefined,
    delete: async () => undefined,
  });
}

const ref = { id: 10, sprintId: 5, actorUserId: 1 };

describe("CreateSprintUseCase", () => {
  it("creates a planned sprint and returns it", async () => {
    const sprints = sprintsDouble();

    const result = await new CreateSprintUseCase(projectsDouble(), sprints).execute({
      id: 10,
      name: " Sprint 1 ",
      goal: "Ship",
      actorUserId: 1,
    });

    expect(result).toMatchObject({ id: 5, name: "Sprint 1", goal: "Ship", status: SprintStatus.PLANNED });
  });

  it("rejects an end date before the start date", async () => {
    const sprints = sprintsDouble();

    await expect(
      new CreateSprintUseCase(projectsDouble(), sprints).execute({
        id: 10,
        name: "S",
        startDate: "2026-11-10",
        endDate: "2026-11-01",
        actorUserId: 1,
      }),
    ).rejects.toThrow(InvalidSprintDatesError);
    expect(sprints.save).not.toHaveBeenCalled();
  });

  it("answers not found to people outside the project", async () => {
    await expect(
      new CreateSprintUseCase(projectsDouble(false), sprintsDouble()).execute({
        id: 10,
        name: "S",
        actorUserId: 9,
      }),
    ).rejects.toThrow(ProjectNotFoundError);
  });
});

describe("UpdateSprintUseCase", () => {
  it("updates a planned sprint", async () => {
    const sprints = sprintsDouble();

    await new UpdateSprintUseCase(projectsDouble(), sprints).execute({ ...ref, name: " New " });

    const [saved] = sprints.update.mock.calls[0]!;
    expect(saved.toPrimitives().name).toBe("New");
  });

  it("does not edit a closed sprint", async () => {
    const sprints = sprintsDouble(aSprint({ status: SprintStatus.CLOSED }));

    await expect(
      new UpdateSprintUseCase(projectsDouble(), sprints).execute({ ...ref, name: "x" }),
    ).rejects.toThrow(InvalidSprintStateError);
  });

  it("fails when the sprint is not in the project", async () => {
    await expect(
      new UpdateSprintUseCase(projectsDouble(), sprintsDouble(null)).execute({ ...ref, name: "x" }),
    ).rejects.toThrow(SprintNotFoundError);
  });
});

describe("StartSprintUseCase", () => {
  it("starts a planned sprint when none is active", async () => {
    const sprints = sprintsDouble();

    await new StartSprintUseCase(projectsDouble(), sprints).execute(ref);

    const [saved] = sprints.update.mock.calls[0]!;
    expect(saved.toPrimitives().status).toBe(SprintStatus.ACTIVE);
  });

  it("allows only one active sprint per project", async () => {
    const sprints = sprintsDouble();
    sprints.findActive.mockResolvedValue(aSprint({ id: 6, status: SprintStatus.ACTIVE }));

    await expect(new StartSprintUseCase(projectsDouble(), sprints).execute(ref)).rejects.toThrow(
      ActiveSprintAlreadyExistsError,
    );
    expect(sprints.update).not.toHaveBeenCalled();
  });

  it("cannot start a sprint that is not planned", async () => {
    await expect(
      new StartSprintUseCase(projectsDouble(), sprintsDouble(aSprint({ status: SprintStatus.CLOSED }))).execute(ref),
    ).rejects.toThrow(InvalidSprintStateError);
  });

  it("fails when the sprint does not exist", async () => {
    await expect(
      new StartSprintUseCase(projectsDouble(), sprintsDouble(null)).execute(ref),
    ).rejects.toThrow(SprintNotFoundError);
  });
});

describe("CloseSprintUseCase", () => {
  it("closes an active sprint and sends the unfinished issues back to the backlog", async () => {
    const sprints = sprintsDouble(aSprint({ status: SprintStatus.ACTIVE }));
    const issues = issuesDouble();
    issues.releaseFromSprint.mockResolvedValue(undefined);

    await new CloseSprintUseCase(projectsDouble(), sprints, issues, transactionDouble()).execute(ref);

    const [saved] = sprints.update.mock.calls[0]!;
    expect(saved.toPrimitives().status).toBe(SprintStatus.CLOSED);
    expect(issues.releaseFromSprint).toHaveBeenCalledWith({ ...ref, onlyUnfinished: true });
  });

  it("cannot close a sprint that is not active", async () => {
    const issues = issuesDouble();

    await expect(
      new CloseSprintUseCase(projectsDouble(), sprintsDouble(), issues, transactionDouble()).execute(ref),
    ).rejects.toThrow(InvalidSprintStateError);
    expect(issues.releaseFromSprint).not.toHaveBeenCalled();
  });
});

describe("DeleteSprintUseCase", () => {
  it("deletes a planned sprint and releases all of its issues", async () => {
    const sprints = sprintsDouble();
    const issues = issuesDouble();
    issues.releaseFromSprint.mockResolvedValue(undefined);

    await new DeleteSprintUseCase(projectsDouble(), sprints, issues, transactionDouble()).execute(ref);

    expect(issues.releaseFromSprint).toHaveBeenCalledWith({ ...ref, onlyUnfinished: false });
    expect(sprints.delete).toHaveBeenCalledWith(ref);
  });

  it("does not delete an active or closed sprint", async () => {
    const sprints = sprintsDouble(aSprint({ status: SprintStatus.ACTIVE }));

    await expect(
      new DeleteSprintUseCase(projectsDouble(), sprints, issuesDouble(), transactionDouble()).execute(ref),
    ).rejects.toThrow(InvalidSprintStateError);
    expect(sprints.delete).not.toHaveBeenCalled();
  });
});

describe("AssignIssueSprintUseCase", () => {
  const input = { id: 10, issueId: 100, sprintId: 5, actorUserId: 1 };

  it("moves the issue and its subtasks into the sprint", async () => {
    const issues = issuesDouble();

    await new AssignIssueSprintUseCase(projectsDouble(), sprintsDouble(), issues, transactionDouble()).execute(input);

    const [saved] = issues.update.mock.calls[0]!;
    expect(saved.sprintId).toBe(5);
    expect(issues.setChildrenSprint).toHaveBeenCalledWith({
      id: 10,
      issueId: 100,
      sprintId: 5,
      actorUserId: 1,
    });
  });

  it("sends the issue back to the backlog with a null sprint", async () => {
    const issues = issuesDouble(anIssue({ sprintId: 5 }));
    const sprints = sprintsDouble();

    await new AssignIssueSprintUseCase(projectsDouble(), sprints, issues, transactionDouble()).execute({
      ...input,
      sprintId: null,
    });

    const [saved] = issues.update.mock.calls[0]!;
    expect(saved.sprintId).toBeNull();
    expect(sprints.findById).not.toHaveBeenCalled();
  });

  it("does not move a subtask: it follows its parent", async () => {
    const issues = issuesDouble(anIssue({ parentId: 50 }));

    await expect(
      new AssignIssueSprintUseCase(projectsDouble(), sprintsDouble(), issues, transactionDouble()).execute(input),
    ).rejects.toThrow(InvalidIssueParentError);
    expect(issues.update).not.toHaveBeenCalled();
  });

  it("rejects a sprint from another project", async () => {
    await expect(
      new AssignIssueSprintUseCase(projectsDouble(), sprintsDouble(null), issuesDouble(), transactionDouble()).execute(input),
    ).rejects.toThrow(InvalidIssueReferenceError);
  });

  it("rejects a closed sprint", async () => {
    await expect(
      new AssignIssueSprintUseCase(
        projectsDouble(),
        sprintsDouble(aSprint({ status: SprintStatus.CLOSED })),
        issuesDouble(),
        transactionDouble(),
      ).execute(input),
    ).rejects.toThrow(InvalidSprintStateError);
  });

  it("fails when the issue does not exist", async () => {
    const issues = issuesDouble();
    issues.findById.mockResolvedValue(null);

    await expect(
      new AssignIssueSprintUseCase(projectsDouble(), sprintsDouble(), issues, transactionDouble()).execute(input),
    ).rejects.toThrow(IssueNotFoundError);
  });
});

describe("GetPlanningUseCase", () => {
  it("returns sprints, columns and every issue of the project", async () => {
    const issues = issuesDouble();
    issues.findAllByProject.mockResolvedValue([anIssue()]);

    const result = await new GetPlanningUseCase(
      projectsDouble(),
      sprintsDouble(),
      issues,
      catalogDouble(),
    ).execute({ id: 10, actorUserId: 1 });

    expect(result.sprints).toHaveLength(1);
    expect(result.columns).toEqual(columns);
    expect(result.issues[0]?.issueKey).toBe("WEB-7");
    expect(issues.findAllByProject).toHaveBeenCalledWith({ id: 10 });
  });

  it("answers not found to people outside the project", async () => {
    await expect(
      new GetPlanningUseCase(projectsDouble(false), sprintsDouble(), issuesDouble(), catalogDouble()).execute({
        id: 10,
        actorUserId: 9,
      }),
    ).rejects.toThrow(ProjectNotFoundError);
  });
});
