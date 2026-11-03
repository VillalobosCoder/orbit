import { DUE_SOON_DAYS } from "@orbit/shared";
import type { NotificationRepository } from "../ports/notification-repository.port.js";

export class GenerateDueNotificationsUseCase {
  constructor(private readonly notifications: NotificationRepository) {}

  execute(): Promise<number> {
    return this.notifications.generateDue({ soonDays: DUE_SOON_DAYS });
  }
}
