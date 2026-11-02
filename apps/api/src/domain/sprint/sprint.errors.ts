import { DomainError } from "../shared/domain-error.js";

export type SprintStateReason =
  | "closedNotEditable"
  | "onlyPlannedStart"
  | "onlyActiveClose"
  | "onlyPlannedDelete"
  | "closedNoIssues";

export class SprintNotFoundError extends DomainError {
  readonly statusCode = 404;

  constructor(sprintId: number) {
    super("errors.sprint.notFound", { sprintId });
  }
}

export class InvalidSprintDatesError extends DomainError {
  readonly statusCode = 400;

  constructor() {
    super("errors.sprint.endBeforeStart");
  }
}

export class InvalidSprintStateError extends DomainError {
  readonly statusCode = 409;

  constructor(reason: SprintStateReason) {
    super(`errors.sprint.state.${reason}`);
  }
}

export class SprintNameAlreadyExistsError extends DomainError {
  readonly statusCode = 409;

  constructor(name: string) {
    super("errors.sprint.nameExists", { name });
  }
}

export class ActiveSprintAlreadyExistsError extends DomainError {
  readonly statusCode = 409;

  constructor() {
    super("errors.sprint.alreadyActive");
  }
}
