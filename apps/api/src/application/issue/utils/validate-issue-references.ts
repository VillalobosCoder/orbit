import type {
  BoardColumnDto,
  IssueTypeDto,
  PriorityDto,
  ProjectMemberDto,
} from "@orbit/shared";
import {
  InvalidIssueAssigneeError,
  InvalidIssueReferenceError,
} from "../../../domain/issue/issue.errors.js";

export function assertIssueType(types: IssueTypeDto[], typeId: number): void {
  if (!types.some((type) => type.id === typeId)) {
    throw new InvalidIssueReferenceError("El tipo de issue");
  }
}

export function assertPriority(
  priorities: PriorityDto[],
  priorityId: number | null | undefined,
): void {
  if (
    priorityId != null &&
    !priorities.some((priority) => priority.id === priorityId)
  ) {
    throw new InvalidIssueReferenceError("La prioridad");
  }
}

export function findColumn(
  columns: BoardColumnDto[],
  columnId: number,
): BoardColumnDto {
  const column = columns.find((item) => item.id === columnId);

  if (!column) {
    throw new InvalidIssueReferenceError("La columna");
  }

  return column;
}

export function normalizeAssignees(
  members: ProjectMemberDto[],
  assigneeIds: number[],
): number[] {
  const unique = [...new Set(assigneeIds)];

  for (const userId of unique) {
    if (!members.some((member) => member.id === userId)) {
      throw new InvalidIssueAssigneeError(userId);
    }
  }

  return unique;
}
