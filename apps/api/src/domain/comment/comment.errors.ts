import { DomainError } from "../shared/domain-error.js";

export class CommentNotFoundError extends DomainError {
  readonly statusCode = 404;

  constructor(commentId: number) {
    super(`No se encontró el comentario ${commentId}.`);
  }
}

export class NotCommentAuthorError extends DomainError {
  readonly statusCode = 403;

  constructor() {
    super("Solo el autor puede modificar o borrar su comentario.");
  }
}
