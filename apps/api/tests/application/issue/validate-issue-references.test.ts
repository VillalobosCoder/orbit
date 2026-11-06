import { describe, expect, it } from "vitest";
import {
  InvalidIssueAssigneeError,
  InvalidIssueParentError,
  InvalidIssueReferenceError,
} from "../../../src/domain/issue/issue.errors.js";
import {
  assertDifficulty,
  assertParent,
  assertPriority,
  findColumn,
  findIssueType,
  normalizeAssignees,
} from "../../../src/application/issue/utils/validate-issue-references.js";
import { anIssue, columns, difficulties, issueTypes, members, priorities } from "../../support/fixtures.js";

const [task, subtask] = issueTypes as [(typeof issueTypes)[0], (typeof issueTypes)[1]];

describe("assertPriority / assertDifficulty", () => {
  it("accept empty values and catalog values", () => {
    expect(() => assertPriority(priorities, null)).not.toThrow();
    expect(() => assertPriority(priorities, undefined)).not.toThrow();
    expect(() => assertPriority(priorities, 1)).not.toThrow();
    expect(() => assertDifficulty(difficulties, 2)).not.toThrow();
  });

  it("reject ids outside the catalog", () => {
    expect(() => assertPriority(priorities, 99)).toThrow(InvalidIssueReferenceError);
    expect(() => assertDifficulty(difficulties, 99)).toThrow(InvalidIssueReferenceError);
  });
});

describe("findIssueType / findColumn", () => {
  it("return the matching item", () => {
    expect(findIssueType(issueTypes, 2).isSubtask).toBe(true);
    expect(findColumn(columns, 3).id).toBe(3);
  });

  it("reject ids that belong to another project", () => {
    expect(() => findIssueType(issueTypes, 99)).toThrow(InvalidIssueReferenceError);
    expect(() => findColumn(columns, 99)).toThrow(InvalidIssueReferenceError);
  });
});

describe("assertParent", () => {
  it("allows a normal issue without parent", () => {
    expect(() =>
      assertParent({ type: task, types: issueTypes, parentId: null, parent: null }),
    ).not.toThrow();
  });

  it("forbids a parent on an issue that is not a subtask", () => {
    expect(() =>
      assertParent({ type: task, types: issueTypes, parentId: 5, parent: anIssue({ id: 5 }) }),
    ).toThrow(InvalidIssueParentError);
  });

  it("requires a parent for a subtask", () => {
    expect(() =>
      assertParent({ type: subtask, types: issueTypes, parentId: null, parent: null }),
    ).toThrow(InvalidIssueParentError);
  });

  it("forbids an issue being its own parent", () => {
    expect(() =>
      assertParent({
        type: subtask,
        types: issueTypes,
        parentId: 100,
        parent: anIssue({ id: 100 }),
        issueId: 100,
      }),
    ).toThrow(InvalidIssueParentError);
  });

  it("rejects a parent that does not exist in the project", () => {
    expect(() =>
      assertParent({ type: subtask, types: issueTypes, parentId: 5, parent: null }),
    ).toThrow(InvalidIssueReferenceError);
  });

  it("forbids nesting a subtask under another subtask", () => {
    expect(() =>
      assertParent({
        type: subtask,
        types: issueTypes,
        parentId: 5,
        parent: anIssue({ id: 5, typeId: 2 }),
      }),
    ).toThrow(InvalidIssueParentError);
  });

  it("accepts a subtask under a normal issue", () => {
    expect(() =>
      assertParent({
        type: subtask,
        types: issueTypes,
        parentId: 5,
        parent: anIssue({ id: 5, typeId: 1 }),
      }),
    ).not.toThrow();
  });
});

describe("normalizeAssignees", () => {
  it("removes duplicates and keeps order", () => {
    expect(normalizeAssignees(members, [2, 1, 2])).toEqual([2, 1]);
  });

  it("rejects people who are not members of the project", () => {
    expect(() => normalizeAssignees(members, [1, 42])).toThrow(InvalidIssueAssigneeError);
  });

  it("accepts an empty list", () => {
    expect(normalizeAssignees(members, [])).toEqual([]);
  });
});
