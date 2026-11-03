import type {
  NotificationDto,
  NotificationListQueryDto,
} from "@orbit/shared";
import type { ActorUserId } from "../../shared/actor.js";

export interface NotificationRepository {
  findPage(
    query: NotificationListQueryDto & { userId: ActorUserId },
  ): Promise<{ items: NotificationDto[]; total: number; page: number }>;
  countUnread(userId: ActorUserId): Promise<number>;
  markRead(query: { id: number; userId: ActorUserId }): Promise<boolean>;
  markAllRead(userId: ActorUserId): Promise<void>;
  isEnabled(userId: ActorUserId): Promise<boolean>;
  setEnabled(command: { userId: ActorUserId; enabled: boolean }): Promise<void>;
  generateDue(query: { soonDays: number }): Promise<number>;
  deleteDueForIssue(issueId: number): Promise<void>;
}
