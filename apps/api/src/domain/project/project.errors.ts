import { DomainError } from "../shared/domain-error.js";

export class InvalidProjectKeyError extends DomainError {
  readonly statusCode = 400;

  constructor(raw: string) {
    super("errors.project.invalidKey", { raw });
  }
}

export class ProjectNotFoundError extends DomainError {
  readonly statusCode = 404;

  constructor(id: number) {
    super("errors.project.notFound", { id });
  }
}

export class ProjectKeyAlreadyExistsError extends DomainError {
  readonly statusCode = 409;

  constructor(projectKey: string) {
    super("errors.project.keyExists", { projectKey });
  }
}

export class NotProjectOwnerError extends DomainError {
  readonly statusCode = 403;

  constructor() {
    super("errors.project.onlyOwner");
  }
}

export class ProjectMemberAlreadyExistsError extends DomainError {
  readonly statusCode = 409;

  constructor() {
    super("errors.project.alreadyMember");
  }
}

export class ProjectMemberNotFoundError extends DomainError {
  readonly statusCode = 404;

  constructor(userId: number) {
    super("errors.project.notMember", { userId });
  }
}

export class CannotRemoveProjectOwnerError extends DomainError {
  readonly statusCode = 400;

  constructor() {
    super("errors.project.cannotRemoveOwner");
  }
}
