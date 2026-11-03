import type { PageDto } from "../api/api.dto.js";
import type { NotificationType } from "../../enums/notification.enum.js";

export type NotificationDto = {
  id: number;
  type: NotificationType;
  projectId: number;
  issueId: number;
  issueKey: string;
  issueTitle: string;
  actorName: string | null;
  dueDate: string | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationListQueryDto = {
  page: number;
  pageSize: number;
};

export type NotificationListDto = PageDto<NotificationDto> & {
  unreadCount: number;
  enabled: boolean;
};

export type NotificationIdRequestDto = {
  id: number;
};

export type SetNotificationPreferenceRequestDto = {
  enabled: boolean;
};
