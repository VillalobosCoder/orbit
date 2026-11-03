import type { Actor } from "../../shared/actor.js";
import type { NotificationRepository } from "../ports/notification-repository.port.js";

export class MarkAllNotificationsReadUseCase {
  constructor(private readonly notifications: NotificationRepository) {}

  execute({ actorUserId }: Actor): Promise<void> {
    return this.notifications.markAllRead(actorUserId);
  }
}
