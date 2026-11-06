import { describe, expect, it } from "vitest";
import { MoveIssueUseCase } from "../../../src/application/issue/use-cases/move-issue.use-case.js";
import {
  InvalidIssueReferenceError,
  IssueNotFoundError,
} from "../../../src/domain/issue/issue.errors.js";
import { ProjectNotFoundError } from "../../../src/domain/project/project.errors.js";
import { anIssue } from "../../support/fixtures.js";
import { catalogDouble, issuesDouble, projectsDouble } from "../../support/issue-ports.js";

function setup({ isMember = true, neighbors = {} as Record<number, ReturnType<typeof anIssue>> } = {}) {
  const issues = issuesDouble();
  issues.findById.mockImplementation(async ({ issueId }) =>
    issueId === 100 ? anIssue() : (neighbors[issueId] ?? null),
  );

  return {
    issues,
    useCase: new MoveIssueUseCase(projectsDouble(isMember), issues, catalogDouble()),
  };
}

const input = { id: 10, issueId: 100, columnId: 2, actorUserId: 1 };

describe("MoveIssueUseCase", () => {
  it("places the card between its two neighbors", async () => {
    const { useCase, issues } = setup({
      neighbors: {
        7: anIssue({ id: 7, columnId: 2, boardPosition: 1000 }),
        8: anIssue({ id: 8, columnId: 2, boardPosition: 2000 }),
      },
    });

    await useCase.execute({ ...input, previousIssueId: 7, nextIssueId: 8 });

    const [saved, actor] = issues.update.mock.calls[0]!;
    expect(saved).toMatchObject({ columnId: 2, boardPosition: 1500 });
    expect(actor).toBe(1);
  });

  it("places the card after the last one when there is no next neighbor", async () => {
    const { useCase, issues } = setup({
      neighbors: { 7: anIssue({ id: 7, columnId: 2, boardPosition: 1000 }) },
    });

    await useCase.execute({ ...input, previousIssueId: 7 });

    const [saved] = issues.update.mock.calls[0]!;
    expect(saved.boardPosition).toBeGreaterThan(1000);
  });

  it("places the card before the first one when there is no previous neighbor", async () => {
    const { useCase, issues } = setup({
      neighbors: { 8: anIssue({ id: 8, columnId: 2, boardPosition: 2000 }) },
    });

    await useCase.execute({ ...input, nextIssueId: 8 });

    const [saved] = issues.update.mock.calls[0]!;
    expect(saved.boardPosition).toBeLessThan(2000);
  });

  it("resolves the issue when dropped in a done column", async () => {
    const { useCase, issues } = setup();

    await useCase.execute({ ...input, columnId: 3 });

    const [saved] = issues.update.mock.calls[0]!;
    expect(saved.resolvedAt).toBeInstanceOf(Date);
  });

  it("rejects a neighbor that is in another column", async () => {
    const { useCase, issues } = setup({
      neighbors: { 7: anIssue({ id: 7, columnId: 1, boardPosition: 1000 }) },
    });

    await expect(useCase.execute({ ...input, previousIssueId: 7 })).rejects.toThrow(
      InvalidIssueReferenceError,
    );
    expect(issues.update).not.toHaveBeenCalled();
  });

  it("rejects a neighbor that does not exist in the project", async () => {
    const { useCase } = setup();

    await expect(useCase.execute({ ...input, nextIssueId: 999 })).rejects.toThrow(
      InvalidIssueReferenceError,
    );
  });

  it("rejects using the card itself as its neighbor", async () => {
    const { useCase, issues } = setup();
    issues.findById.mockResolvedValue(anIssue({ id: 100, columnId: 2 }));

    await expect(useCase.execute({ ...input, previousIssueId: 100 })).rejects.toThrow(
      InvalidIssueReferenceError,
    );
  });

  it("rejects a column of another project", async () => {
    const { useCase } = setup();

    await expect(useCase.execute({ ...input, columnId: 99 })).rejects.toThrow(
      InvalidIssueReferenceError,
    );
  });

  it("fails when the issue does not exist", async () => {
    const { useCase, issues } = setup();
    issues.findById.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toThrow(IssueNotFoundError);
  });

  it("answers not found to people outside the project", async () => {
    const { useCase } = setup({ isMember: false });

    await expect(useCase.execute(input)).rejects.toThrow(ProjectNotFoundError);
  });
});
