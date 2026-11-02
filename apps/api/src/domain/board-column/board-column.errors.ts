import { DomainError } from "../shared/domain-error.js";

export class BoardColumnNotFoundError extends DomainError {
  readonly statusCode = 404;

  constructor(columnId: number) {
    super("errors.boardColumn.notFound", { columnId });
  }
}

export class BoardColumnNameAlreadyExistsError extends DomainError {
  readonly statusCode = 409;

  constructor(name: string) {
    super("errors.boardColumn.nameExists", { name });
  }
}

export class InvalidBoardColumnOrderError extends DomainError {
  readonly statusCode = 400;

  constructor() {
    super("errors.boardColumn.reorderMismatch");
  }
}

export class InvalidBoardColumnTargetError extends DomainError {
  readonly statusCode = 400;

  constructor() {
    super("errors.boardColumn.chooseTarget");
  }
}

export class LastBoardColumnOfCategoryError extends DomainError {
  readonly statusCode = 409;

  constructor() {
    super("errors.boardColumn.needTodoAndDone");
  }
}
