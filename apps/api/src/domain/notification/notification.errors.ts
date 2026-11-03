import { DomainError } from "../shared/domain-error.js";

export class NotificationNotFoundError extends DomainError {
  readonly statusCode = 404;

  constructor(notificationId: number) {
    super("errors.notification.notFound", { notificationId });
  }
}
