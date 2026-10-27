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
    throw new InvalidIssueReferenceError("La prioridad");
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
    throw new InvalidIssueReferenceError("La dificultad");
  }
}

export function findIssueType(
  types: IssueTypeDto[],
  typeId: number,
): IssueTypeDto {
  const type = types.find((item) => item.id === typeId);

  if (!type) {
    throw new InvalidIssueReferenceError("El tipo de issue");
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
        "Solo las subtareas pueden tener un issue padre.",
      );
    }
    return;
  }

  if (parentId == null) {
    throw new InvalidIssueParentError("Una subtarea necesita un issue padre.");
  }

  if (parentId === issueId) {
    throw new InvalidIssueParentError(
      "Un issue no puede ser su propio padre.",
    );
  }

  if (!parent) {
    throw new InvalidIssueReferenceError("El issue padre");
  }

  if (types.find((item) => item.id === parent.typeId)?.isSubtask) {
    throw new InvalidIssueParentError(
      "Una subtarea no puede ser el padre de otra subtarea.",
    );
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
