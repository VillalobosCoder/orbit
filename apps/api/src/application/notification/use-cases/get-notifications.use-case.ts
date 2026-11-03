import type {
  NotificationListDto,
  NotificationListQueryDto,
} from "@orbit/shared";
import type { Actor } from "../../shared/actor.js";
import type { NotificationRepository } from "../ports/notification-repository.port.js";

export class GetNotificationsUseCase {
  constructor(private readonly notifications: NotificationRepository) {}

  async execute({
    actorUserId,
    page,
    pageSize,
  }: NotificationListQueryDto & Actor): Promise<NotificationListDto> {
    const [result, unreadCount, enabled] = await Promise.all([
      this.notifications.findPage({ userId: actorUserId, page, pageSize }),
      this.notifications.countUnread(actorUserId),
      this.notifications.isEnabled(actorUserId),
    ]);

    return { ...result, pageSize, unreadCount, enabled };
  }
}
