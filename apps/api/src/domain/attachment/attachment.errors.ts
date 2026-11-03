import { DomainError } from "../shared/domain-error.js";

export class AttachmentNotFoundError extends DomainError {
  readonly statusCode = 404;

  constructor(attachmentId: number) {
    super("errors.attachment.notFound", { attachmentId });
  }
}

export class InvalidAttachmentError extends DomainError {
  readonly statusCode = 415;

  constructor() {
    super("errors.attachment.invalid");
  }
}

export class AttachmentTooLargeError extends DomainError {
  readonly statusCode = 413;

  constructor(maxMegabytes: number) {
    super("errors.attachment.tooLarge", { maxMegabytes });
  }
}

export class TooManyAttachmentsError extends DomainError {
  readonly statusCode = 409;

  constructor(max: number) {
    super("errors.attachment.tooMany", { max });
  }
}
