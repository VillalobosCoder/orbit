import { DomainError } from "../shared/domain-error.js";

export type IssueReference =
  | "priority"
  | "difficulty"
  | "type"
  | "parent"
  | "column"
  | "sprint"
  | "neighbor";

export type IssueParentReason =
  | "onlySubtasks"
  | "subtaskNeedsParent"
  | "ownParent"
  | "subtaskAsParent"
  | "withChildren"
  | "followsParentSprint";

export type IssueAction = "move" | "changeSprint";

export class IssueNotFoundError extends DomainError {
  readonly statusCode = 404;

  constructor(issueId: number) {
    super("errors.issue.notFound", { issueId });
  }
}

export class InvalidIssueReferenceError extends DomainError {
  readonly statusCode = 400;

  constructor(reference: IssueReference) {
    super(`errors.issue.reference.${reference}`);
  }
}

export class InvalidIssueParentError extends DomainError {
  readonly statusCode = 400;

  constructor(reason: IssueParentReason) {
    super(`errors.issue.parent.${reason}`);
  }
}

export class InvalidIssueAssigneeError extends DomainError {
  readonly statusCode = 400;

  constructor(userId: number) {
    super("errors.issue.assigneeNotMember", { userId });
  }
}

export class IssueActionNotAllowedError extends DomainError {
  readonly statusCode = 403;

  constructor(action: IssueAction) {
    super(`errors.issue.actionNotAllowed.${action}`);
  }
}
