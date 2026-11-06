import { describe, expect, it } from "vitest";
import { Issue } from "../../../src/domain/issue/issue.entity.js";
import { InvalidIssueDatesError } from "../../../src/domain/issue/issue.errors.js";
import { anIssue } from "../../support/fixtures.js";

const base = {
  projectId: 10,
  issueNumber: 1,
  columnId: 1,
  sprintId: null,
  reporterId: 1,
  boardPosition: 1024,
  assigneeIds: [],
  isDone: false,
  typeId: 1,
};

describe("Issue", () => {
  describe("register", () => {
    it("trims the title and turns blank optional text into null", () => {
      const issue = Issue.register({ ...base, title: "  Fix it ", description: "   " });

      expect(issue.title).toBe("Fix it");
      expect(issue.description).toBeNull();
      expect(issue.resolvedAt).toBeNull();
    });

    it("starts resolved when it is created in a done column", () => {
      const issue = Issue.register({ ...base, title: "x", isDone: true });

      expect(issue.resolvedAt).toBeInstanceOf(Date);
    });

    it("keeps start and due dates, estimate and story points", () => {
      const issue = Issue.register({
        ...base,
        title: "x",
        startDate: "2026-11-01",
        dueDate: "2026-11-10",
        estimateMinutes: 90,
        storyPoints: 3,
      });

      expect(issue).toMatchObject({
        startDate: "2026-11-01",
        dueDate: "2026-11-10",
        estimateMinutes: 90,
        storyPoints: 3,
      });
    });

    it("rejects a start date after the due date", () => {
      expect(() =>
        Issue.register({ ...base, title: "x", startDate: "2026-11-10", dueDate: "2026-11-01" }),
      ).toThrow(InvalidIssueDatesError);
    });

    it("accepts the same day for start and due date", () => {
      expect(() =>
        Issue.register({ ...base, title: "x", startDate: "2026-11-01", dueDate: "2026-11-01" }),
      ).not.toThrow();
    });

    it("treats empty date strings as no date", () => {
      const issue = Issue.register({ ...base, title: "x", startDate: "", dueDate: "" });

      expect(issue.startDate).toBeNull();
      expect(issue.dueDate).toBeNull();
    });
  });

  describe("withDetails", () => {
    it("replaces the editable fields and keeps identity, column and assignees", () => {
      const updated = anIssue({ assigneeIds: [2], columnId: 2 }).withDetails({
        title: " New title ",
        typeId: 1,
        priorityId: 4,
      });

      expect(updated).toMatchObject({
        id: 100,
        title: "New title",
        priorityId: 4,
        columnId: 2,
        assigneeIds: [2],
      });
    });

    it("validates dates again on edit", () => {
      expect(() =>
        anIssue().withDetails({ title: "x", typeId: 1, startDate: "2026-12-01", dueDate: "2026-11-01" }),
      ).toThrow(InvalidIssueDatesError);
    });
  });

  describe("movedTo", () => {
    it("marks the issue resolved when it enters a done column", () => {
      const moved = anIssue().movedTo({ columnId: 3, boardPosition: 2048, isDone: true });

      expect(moved.columnId).toBe(3);
      expect(moved.boardPosition).toBe(2048);
      expect(moved.resolvedAt).toBeInstanceOf(Date);
    });

    it("keeps the original resolution time when moved between done columns", () => {
      const resolvedAt = new Date("2026-01-01T00:00:00Z");

      const moved = anIssue({ resolvedAt }).movedTo({ columnId: 4, boardPosition: 1, isDone: true });

      expect(moved.resolvedAt).toBe(resolvedAt);
    });

    it("clears the resolution when it leaves the done column", () => {
      const moved = anIssue({ resolvedAt: new Date() }).movedTo({
        columnId: 1,
        boardPosition: 1,
        isDone: false,
      });

      expect(moved.resolvedAt).toBeNull();
    });
  });

  it("changes sprint and assignees without touching other fields", () => {
    const updated = anIssue().withSprint(5).withAssignees([1, 2]);

    expect(updated).toMatchObject({ sprintId: 5, assigneeIds: [1, 2], title: "Fix login" });
  });

  it("refuses to read the id of an unsaved issue", () => {
    const issue = Issue.register({ ...base, title: "x" });

    expect(() => issue.persistedId).toThrow();
  });
});
