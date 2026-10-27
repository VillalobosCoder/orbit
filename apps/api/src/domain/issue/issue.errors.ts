import { DomainError } from "../shared/domain-error.js";

export class IssueNotFoundError extends DomainError {
  readonly statusCode = 404;

  constructor(issueId: number) {
    super(`No se encontró el issue ${issueId}.`);
  }
}

export class InvalidIssueReferenceError extends DomainError {
  readonly statusCode = 400;

  constructor(reference: string) {
    super(`${reference} no pertenece a este proyecto.`);
  }
}

export class InvalidIssueAssigneeError extends DomainError {
  readonly statusCode = 400;

  constructor(userId: number) {
    super(`El usuario ${userId} no es miembro del proyecto.`);
  }
}
