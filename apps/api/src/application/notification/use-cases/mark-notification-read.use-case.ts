import type { NotificationIdRequestDto } from "@orbit/shared";
import { NotificationNotFoundError } from "../../../domain/notification/notification.errors.js";
import type { Actor } from "../../shared/actor.js";
import type { NotificationRepository } from "../ports/notification-repository.port.js";

export class MarkNotificationReadUseCase {
  constructor(private readonly notifications: NotificationRepository) {}

  async execute({
    id,
    actorUserId,
  }: NotificationIdRequestDto & Actor): Promise<void> {
    const found = await this.notifications.markRead({ id, userId: actorUserId });

    if (!found) {
      throw new NotificationNotFoundError(id);
    }
  }
}
