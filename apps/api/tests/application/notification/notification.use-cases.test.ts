import { describe, expect, it } from "vitest";
import type { NotificationDto } from "@orbit/shared";
import { DUE_SOON_DAYS, NotificationType } from "@orbit/shared";
import type { NotificationRepository } from "../../../src/application/notification/ports/notification-repository.port.js";
import { GenerateDueNotificationsUseCase } from "../../../src/application/notification/use-cases/generate-due-notifications.use-case.js";
import { GetNotificationsUseCase } from "../../../src/application/notification/use-cases/get-notifications.use-case.js";
import { MarkAllNotificationsReadUseCase } from "../../../src/application/notification/use-cases/mark-all-notifications-read.use-case.js";
import { MarkNotificationReadUseCase } from "../../../src/application/notification/use-cases/mark-notification-read.use-case.js";
import { SetNotificationPreferenceUseCase } from "../../../src/application/notification/use-cases/set-notification-preference.use-case.js";
import { NotificationNotFoundError } from "../../../src/domain/notification/notification.errors.js";
import { stub } from "../../support/stub.js";

const item: NotificationDto = {
  id: 1,
  type: NotificationType.ISSUE_DUE_SOON,
  projectId: 10,
  issueId: 100,
  issueKey: "WEB-7",
  issueTitle: "Fix login",
  actorName: null,
  dueDate: "2026-11-05",
  readAt: null,
  createdAt: "2026-11-03T00:00:00.000Z",
};

describe("GetNotificationsUseCase", () => {
  it("returns a page together with the unread count and the preference", async () => {
    const repo = stub<NotificationRepository>({
      findPage: async () => ({ items: [item], total: 25, page: 2 }),
      countUnread: async () => 3,
      isEnabled: async () => false,
    });

    const result = await new GetNotificationsUseCase(repo).execute({
      actorUserId: 4,
      page: 2,
      pageSize: 10,
    });

    expect(repo.findPage).toHaveBeenCalledWith({ userId: 4, page: 2, pageSize: 10 });
    expect(result).toEqual({
      items: [item],
      total: 25,
      page: 2,
      pageSize: 10,
      unreadCount: 3,
      enabled: false,
    });
  });

  it("only ever reads the notifications of the acting user", async () => {
    const repo = stub<NotificationRepository>({
      findPage: async () => ({ items: [], total: 0, page: 1 }),
      countUnread: async () => 0,
      isEnabled: async () => true,
    });

    await new GetNotificationsUseCase(repo).execute({ actorUserId: 9, page: 1, pageSize: 10 });

    expect(repo.countUnread).toHaveBeenCalledWith(9);
    expect(repo.isEnabled).toHaveBeenCalledWith(9);
  });
});

describe("MarkNotificationReadUseCase", () => {
  it("marks one of the user's notifications as read", async () => {
    const repo = stub<NotificationRepository>({ markRead: async () => true });

    await new MarkNotificationReadUseCase(repo).execute({ id: 1, actorUserId: 4 });

    expect(repo.markRead).toHaveBeenCalledWith({ id: 1, userId: 4 });
  });

  it("answers not found for a notification that is not theirs", async () => {
    const repo = stub<NotificationRepository>({ markRead: async () => false });

    await expect(
      new MarkNotificationReadUseCase(repo).execute({ id: 1, actorUserId: 4 }),
    ).rejects.toThrow(NotificationNotFoundError);
  });
});

describe("MarkAllNotificationsReadUseCase", () => {
  it("marks every notification of the acting user", async () => {
    const repo = stub<NotificationRepository>({ markAllRead: async () => undefined });

    await new MarkAllNotificationsReadUseCase(repo).execute({ actorUserId: 4 });

    expect(repo.markAllRead).toHaveBeenCalledWith(4);
  });
});

describe("SetNotificationPreferenceUseCase", () => {
  it.each([true, false])("stores the preference %s for the acting user", async (enabled) => {
    const repo = stub<NotificationRepository>({ setEnabled: async () => undefined });

    await new SetNotificationPreferenceUseCase(repo).execute({ enabled, actorUserId: 4 });

    expect(repo.setEnabled).toHaveBeenCalledWith({ userId: 4, enabled });
  });
});

describe("GenerateDueNotificationsUseCase", () => {
  it("looks for tasks due within the configured window and reports how many alerts were created", async () => {
    const repo = stub<NotificationRepository>({ generateDue: async () => 6 });

    const created = await new GenerateDueNotificationsUseCase(repo).execute();

    expect(created).toBe(6);
    expect(repo.generateDue).toHaveBeenCalledWith({ soonDays: DUE_SOON_DAYS });
  });
});
