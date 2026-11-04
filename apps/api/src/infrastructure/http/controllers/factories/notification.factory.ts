import { GetNotificationsUseCase } from "../../../../application/notification/use-cases/get-notifications.use-case.js";
import { MarkAllNotificationsReadUseCase } from "../../../../application/notification/use-cases/mark-all-notifications-read.use-case.js";
import { MarkNotificationReadUseCase } from "../../../../application/notification/use-cases/mark-notification-read.use-case.js";
import { NotificationController } from "../notification.controller.js";
import { SetNotificationPreferenceUseCase } from "../../../../application/notification/use-cases/set-notification-preference.use-case.js";
import type { ControllerDependencies } from "../dependencies.js";

export function createNotificationController(dependencies: ControllerDependencies) {
  return new NotificationController(
    new GetNotificationsUseCase(dependencies.notificationRepository),
    new MarkNotificationReadUseCase(dependencies.notificationRepository),
    new MarkAllNotificationsReadUseCase(dependencies.notificationRepository),
    new SetNotificationPreferenceUseCase(dependencies.notificationRepository),
  );
}
