import type {
  BoardColumnDto,
  DifficultyDto,
  IssueTypeDto,
  PriorityDto,
  ProjectMemberDto,
} from "@orbit/shared";
import type { Issue } from "../../../domain/issue/issue.entity.js";
import {
  InvalidIssueAssigneeError,
  InvalidIssueParentError,
  InvalidIssueReferenceError,
} from "../../../domain/issue/issue.errors.js";

export function assertPriority(
  priorities: PriorityDto[],
  priorityId: number | null | undefined,
): void {
  if (
    priorityId != null &&
    !priorities.some((priority) => priority.id === priorityId)
  ) {
    throw new InvalidIssueReferenceError("priority");
  }
}

export function assertDifficulty(
  difficulties: DifficultyDto[],
  difficultyId: number | null | undefined,
): void {
  if (
    difficultyId != null &&
    !difficulties.some((difficulty) => difficulty.id === difficultyId)
  ) {
    throw new InvalidIssueReferenceError("difficulty");
  }
}

export function findIssueType(
  types: IssueTypeDto[],
  typeId: number,
): IssueTypeDto {
  const type = types.find((item) => item.id === typeId);

  if (!type) {
    throw new InvalidIssueReferenceError("type");
  }

  return type;
}


export function assertParent(input: {
  type: IssueTypeDto;
  types: IssueTypeDto[];
  parentId: number | null | undefined;
  parent: Issue | null;
  issueId?: number;
}): void {
  const { type, types, parentId, parent, issueId } = input;

  if (!type.isSubtask) {
    if (parentId != null) {
      throw new InvalidIssueParentError(
        "onlySubtasks",
      );
    }
    return;
  }

  if (parentId == null) {
    throw new InvalidIssueParentError("subtaskNeedsParent");
  }

  if (parentId === issueId) {
    throw new InvalidIssueParentError(
      "ownParent",
    );
  }

  if (!parent) {
    throw new InvalidIssueReferenceError("parent");
  }

  if (types.find((item) => item.id === parent.typeId)?.isSubtask) {
    throw new InvalidIssueParentError(
      "subtaskAsParent",
    );
  }
}

export function findColumn(
  columns: BoardColumnDto[],
  columnId: number,
): BoardColumnDto {
  const column = columns.find((item) => item.id === columnId);

  if (!column) {
    throw new InvalidIssueReferenceError("column");
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
