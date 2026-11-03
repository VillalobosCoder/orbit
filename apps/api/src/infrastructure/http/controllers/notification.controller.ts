import type { NextFunction, Response } from "express";
import type { NotificationListDto } from "@orbit/shared";
import type { GetNotificationsUseCase } from "../../../application/notification/use-cases/get-notifications.use-case.js";
import type { MarkAllNotificationsReadUseCase } from "../../../application/notification/use-cases/mark-all-notifications-read.use-case.js";
import type { MarkNotificationReadUseCase } from "../../../application/notification/use-cases/mark-notification-read.use-case.js";
import type { SetNotificationPreferenceUseCase } from "../../../application/notification/use-cases/set-notification-preference.use-case.js";
import type { AuthedRequest } from "../middleware/auth.middleware.js";
import {
  listNotificationsQuerySchema,
  notificationParamSchema,
  notificationPreferenceSchema,
} from "../schemas/notification.schema.js";

export class NotificationController {
  constructor(
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
    private readonly markReadUseCase: MarkNotificationReadUseCase,
    private readonly markAllReadUseCase: MarkAllNotificationsReadUseCase,
    private readonly setPreferenceUseCase: SetNotificationPreferenceUseCase,
  ) {}

  getAll = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query = listNotificationsQuerySchema.parse(req.query);
      const response: NotificationListDto =
        await this.getNotificationsUseCase.execute({
          ...query,
          actorUserId: req.auth!.id,
        });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  markRead = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = notificationParamSchema.parse(req.params);
      await this.markReadUseCase.execute({ id, actorUserId: req.auth!.id });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  markAllRead = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.markAllReadUseCase.execute({ actorUserId: req.auth!.id });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  setPreference = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { enabled } = notificationPreferenceSchema.parse(req.body);
      await this.setPreferenceUseCase.execute({
        enabled,
        actorUserId: req.auth!.id,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
