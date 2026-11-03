import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import {
  NotificationType,
  StatusTypeKey,
  IssueStatusKey,
  UserStatusKey,
  type NotificationDto,
  type NotificationListQueryDto,
} from "@orbit/shared";
import type { NotificationRepository } from "../../../application/notification/ports/notification-repository.port.js";
import type { ActorUserId } from "../../../application/shared/actor.js";
import type { DbContext } from "../db-context.js";
import { notifications } from "../schema/notifications.js";
import { users } from "../schema/users.js";
import { findStatusId } from "./find-status-id.js";

const ISSUE_ENTITY = "issue";
const DUE_TYPES = [NotificationType.ISSUE_DUE_SOON, NotificationType.ISSUE_OVERDUE];

type DuePayload = {
  projectId: number;
  issueKey: string;
  issueTitle: string;
  dueDate: string;
};

export class DBNotificationRepository implements NotificationRepository {
  constructor(private readonly context: DbContext) {}

  private get db() {
    return this.context.db;
  }

  async findPage({
    userId,
    page,
    pageSize,
  }: NotificationListQueryDto & { userId: ActorUserId }) {
    const where = eq(notifications.recipientId, userId);
    const [{ total }] = await this.db
      .select({ total: sql<number>`count(*)::int` })
      .from(notifications)
      .where(where);
    const currentPage = Math.min(page, Math.max(1, Math.ceil(total / pageSize)));
    const rows = await this.db
      .select()
      .from(notifications)
      .where(where)
      .orderBy(desc(notifications.createdAt), desc(notifications.id))
      .limit(pageSize)
      .offset((currentPage - 1) * pageSize);

    const items = rows.map((row) => {
      const payload = row.payload as DuePayload;

      return {
        id: row.id,
        type: row.type as NotificationType,
        projectId: payload.projectId,
        issueId: row.entityId,
        issueKey: payload.issueKey,
        issueTitle: payload.issueTitle,
        dueDate: payload.dueDate,
        readAt: row.readAt?.toISOString() ?? null,
        createdAt: row.createdAt.toISOString(),
      } satisfies NotificationDto;
    });

    return { items, total, page: currentPage };
  }

  async countUnread(userId: ActorUserId): Promise<number> {
    const [row] = await this.db
      .select({ total: sql<number>`count(*)::int` })
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientId, userId),
          isNull(notifications.readAt),
        ),
      );

    return row.total;
  }

  async markRead({
    id,
    userId,
  }: {
    id: number;
    userId: ActorUserId;
  }): Promise<boolean> {
    const [row] = await this.db
      .update(notifications)
      .set({ readAt: sql`coalesce(${notifications.readAt}, now())` })
      .where(
        and(eq(notifications.id, id), eq(notifications.recipientId, userId)),
      )
      .returning({ id: notifications.id });

    return row !== undefined;
  }

  async markAllRead(userId: ActorUserId): Promise<void> {
    await this.db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notifications.recipientId, userId),
          isNull(notifications.readAt),
        ),
      );
  }

  async isEnabled(userId: ActorUserId): Promise<boolean> {
    const [row] = await this.db
      .select({ enabled: users.notificationsEnabled })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return row?.enabled ?? true;
  }

  async setEnabled({
    userId,
    enabled,
  }: {
    userId: ActorUserId;
    enabled: boolean;
  }): Promise<void> {
    await this.db
      .update(users)
      .set({
        notificationsEnabled: enabled,
        updatedAt: new Date(),
        updatedByUserId: userId,
      })
      .where(eq(users.id, userId));
  }

  async generateDue({ soonDays }: { soonDays: number }): Promise<number> {
    const [deletedIssueStatusId, deletedUserStatusId] = await Promise.all([
      findStatusId(this.db, StatusTypeKey.ISSUE, IssueStatusKey.DELETED),
      findStatusId(this.db, StatusTypeKey.USER, UserStatusKey.DELETED),
    ]);

    const result = await this.db.execute(sql`
      INSERT INTO notifications (recipient_id, type, entity_type, entity_id, payload)
      SELECT
        recipient.user_id,
        CASE WHEN i.due_date < CURRENT_DATE
          THEN ${NotificationType.ISSUE_OVERDUE}
          ELSE ${NotificationType.ISSUE_DUE_SOON}
        END,
        ${ISSUE_ENTITY},
        i.id,
        jsonb_build_object(
          'projectId', i.project_id,
          'issueKey', p.project_key || '-' || i.issue_number,
          'issueTitle', i.title,
          'dueDate', to_char(i.due_date, 'YYYY-MM-DD')
        )
      FROM issues i
      JOIN projects p ON p.id = i.project_id
      CROSS JOIN LATERAL (
        SELECT ia.user_id FROM issue_assignees ia WHERE ia.issue_id = i.id
        UNION
        SELECT i.reporter_id
        WHERE NOT EXISTS (
          SELECT 1 FROM issue_assignees ia WHERE ia.issue_id = i.id
        )
      ) AS recipient
      JOIN users u ON u.id = recipient.user_id
      WHERE i.due_date IS NOT NULL
        AND i.due_date <= CURRENT_DATE + ${soonDays}::int
        AND i.resolved_at IS NULL
        AND i.status_id <> ${deletedIssueStatusId}
        AND u.status_id <> ${deletedUserStatusId}
        AND u.notifications_enabled
      ON CONFLICT ON CONSTRAINT notifications_recipient_type_entity_unique DO NOTHING
    `);

    return result.rowCount ?? 0;
  }

  async deleteDueForIssue(issueId: number): Promise<void> {
    await this.db
      .delete(notifications)
      .where(
        and(
          eq(notifications.entityType, ISSUE_ENTITY),
          eq(notifications.entityId, issueId),
          inArray(notifications.type, DUE_TYPES),
        ),
      );
  }
}
