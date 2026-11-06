import {
  BoardColumnCategory,
  SprintStatus,
  type BoardColumnDto,
  type DifficultyDto,
  type IssueTypeDto,
  type PriorityDto,
  type ProjectMemberDto,
} from "@orbit/shared";
import { BoardColumn } from "../../src/domain/board-column/board-column.entity.js";
import { Comment } from "../../src/domain/comment/comment.entity.js";
import { Issue } from "../../src/domain/issue/issue.entity.js";
import { Sprint } from "../../src/domain/sprint/sprint.entity.js";

export const columns: BoardColumnDto[] = [
  { id: 1, name: "Por hacer", category: BoardColumnCategory.TODO, position: 0, color: null, wipLimit: null },
  { id: 2, name: "En curso", category: BoardColumnCategory.IN_PROGRESS, position: 1, color: null, wipLimit: null },
  { id: 3, name: "Finalizada", category: BoardColumnCategory.DONE, position: 2, color: null, wipLimit: null },
];

export const issueTypes: IssueTypeDto[] = [
  { id: 1, name: "Tarea", isSubtask: false, icon: null },
  { id: 2, name: "Subtarea", isSubtask: true, icon: null },
];

export const priorities: PriorityDto[] = [
  { id: 1, name: "Alta", level: 3, color: null },
  { id: 2, name: "Baja", level: 5, color: null },
];

export const difficulties: DifficultyDto[] = [
  { id: 1, name: "S", level: 2 },
  { id: 2, name: "XL", level: 5 },
];

export function aMember(id: number): ProjectMemberDto {
  return {
    id,
    name: `User${id}`,
    lastName: "Test",
    email: `user${id}@example.com`,
    avatarUrl: null,
  };
}

export const members = [aMember(1), aMember(2), aMember(3)];

export function anIssue(
  overrides: Partial<Parameters<typeof Issue.fromPersistence>[0]> = {},
) {
  return Issue.fromPersistence({
    id: 100,
    projectId: 10,
    issueNumber: 7,
    typeId: 1,
    priorityId: null,
    difficultyId: null,
    parentId: null,
    sprintId: null,
    columnId: 1,
    reporterId: 1,
    title: "Fix login",
    description: null,
    startDate: null,
    dueDate: null,
    estimateMinutes: null,
    storyPoints: null,
    boardPosition: 1024,
    resolvedAt: null,
    assigneeIds: [],
    ...overrides,
  });
}

export function aSprint(
  overrides: Partial<Parameters<typeof Sprint.fromPersistence>[0]> = {},
) {
  return Sprint.fromPersistence({
    id: 5,
    projectId: 10,
    name: "Sprint 1",
    goal: null,
    startDate: null,
    endDate: null,
    status: SprintStatus.PLANNED,
    ...overrides,
  });
}

export function aColumn(
  overrides: Partial<Parameters<typeof BoardColumn.fromPersistence>[0]> = {},
) {
  return BoardColumn.fromPersistence({
    id: 1,
    projectId: 10,
    name: "Por hacer",
    category: BoardColumnCategory.TODO,
    position: 0,
    color: null,
    wipLimit: null,
    ...overrides,
  });
}

export const columnEntities = [
  aColumn({ id: 1, category: BoardColumnCategory.TODO, position: 0 }),
  aColumn({ id: 2, name: "En curso", category: BoardColumnCategory.IN_PROGRESS, position: 1 }),
  aColumn({ id: 3, name: "Finalizada", category: BoardColumnCategory.DONE, position: 2 }),
];

export function aComment(
  overrides: Partial<Parameters<typeof Comment.fromPersistence>[0]> = {},
) {
  return Comment.fromPersistence({
    id: 20,
    issueId: 100,
    authorId: 1,
    body: "Looks good",
    ...overrides,
  });
}
