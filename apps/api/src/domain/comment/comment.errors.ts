import { DomainError } from "../shared/domain-error.js";

export class CommentNotFoundError extends DomainError {
  readonly statusCode = 404;

  constructor(commentId: number) {
    super("errors.comment.notFound", { commentId });
  }
}

export class NotCommentAuthorError extends DomainError {
  readonly statusCode = 403;

  constructor() {
    super("errors.comment.onlyAuthor");
  }
}
