import type { SetNotificationPreferenceRequestDto } from "@orbit/shared";
import type { Actor } from "../../shared/actor.js";
import type { NotificationRepository } from "../ports/notification-repository.port.js";

export class SetNotificationPreferenceUseCase {
  constructor(private readonly notifications: NotificationRepository) {}

  execute({
    enabled,
    actorUserId,
  }: SetNotificationPreferenceRequestDto & Actor): Promise<void> {
    return this.notifications.setEnabled({ userId: actorUserId, enabled });
  }
}
