import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import { CalendarClock, CalendarX2, CheckCheck, Eye } from "lucide-react";
import {
  NotificationType,
  type NotificationDto,
} from "@orbit/shared";
import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadFailedComponent } from "@/components/ui/load-failed-component";
import { PaginationComponent } from "@/components/ui/pagination-component";
import { PageHeaderComponent } from "@/components/ui/page-header-component";
import { TableComponent } from "@/components/ui/table-component";
import type { DataTableFeatures } from "@/components/ui/table-component";
import { formatDate } from "@/features/issues/utils/due-date";
import { useI18n } from "@/i18n/use-i18n";
import {
  useGetNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "../api/queries";

const PAGE_SIZE = 10;

const columnHelper = createColumnHelper<DataTableFeatures, NotificationDto>();

export default function NotificationsPage() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const notifications = useGetNotifications({ page, pageSize: PAGE_SIZE });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const items = notifications.data?.items ?? [];
  const unreadCount = notifications.data?.unreadCount ?? 0;
  const enabled = notifications.data?.enabled ?? true;

  const columns = columnHelper.columns([
    columnHelper.display({
      id: "status",
      header: t("notifications.page.columns.status"),
      cell: ({ row }) =>
        row.original.readAt === null ? (
          <Badge variant="info">{t("notifications.page.status.unread")}</Badge>
        ) : (
          <Badge variant="muted">{t("notifications.page.status.read")}</Badge>
        ),
    }),
    columnHelper.display({
      id: "issue",
      header: t("notifications.page.columns.issue"),
      cell: ({ row }) => (
        <div className="flex max-w-xs min-w-0 flex-col">
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.issueKey}
          </span>
          <span
            title={row.original.issueTitle}
            className={cn(
              "truncate",
              row.original.readAt === null && "font-medium",
            )}
          >
            {row.original.issueTitle}
          </span>
        </div>
      ),
    }),
    columnHelper.display({
      id: "notice",
      header: t("notifications.page.columns.notice"),
      cell: ({ row }) => {
        const isOverdue = row.original.type === NotificationType.ISSUE_OVERDUE;
        const Icon = isOverdue ? CalendarX2 : CalendarClock;

        return (
          <span
            className={cn(
              "flex items-center gap-2",
              isOverdue ? "text-destructive" : "text-warning",
            )}
          >
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            {t(
              isOverdue
                ? "notifications.page.overdue"
                : "notifications.page.dueSoon",
              { date: formatDate(row.original.dueDate, locale) },
            )}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "received",
      header: t("notifications.page.columns.received"),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleString(locale, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: t("notifications.page.columns.actions"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(
                `/projects/${row.original.projectId}/issues/${row.original.issueId}`,
              )
            }
          >
            <Eye />
            {t("notifications.page.openIssue")}
          </Button>
          {row.original.readAt === null && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              loading={
                markRead.isPending && markRead.variables?.id === row.original.id
              }
              onClick={() => markRead.mutate({ id: row.original.id })}
            >
              <CheckCheck />
              {t("notifications.page.markRead")}
            </Button>
          )}
        </div>
      ),
    }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <PageHeaderComponent
        title={t("notifications.page.title")}
        description={t("notifications.page.description")}
      >
        <Button
          type="button"
          variant="outline"
          disabled={unreadCount === 0}
          loading={markAllRead.isPending}
          onClick={() => markAllRead.mutate()}
        >
          <CheckCheck />
          {t("notifications.page.markAllRead")}
        </Button>
      </PageHeaderComponent>

      {notifications.isError && !notifications.data ? (
        <LoadFailedComponent
          onRetry={() => void notifications.refetch()}
          isRetrying={notifications.isFetching}
        />
      ) : (
        <TableComponent
          data={items}
          columns={columns}
          isLoading={notifications.isPending}
          minRows={PAGE_SIZE}
          emptyMessage={t("notifications.page.empty")}
        />
      )}

      {notifications.data && (
        <PaginationComponent
          page={notifications.data.page}
          pageSize={notifications.data.pageSize}
          total={notifications.data.total}
          onPageChange={setPage}
        />
      )}

      {!enabled && (
        <p className="text-sm text-muted-foreground">
          {t("notifications.page.disabledHint")}{" "}
          <Link to="/configuracion" className="underline">
            {t("notifications.page.settings")}
          </Link>
        </p>
      )}
    </div>
  );
}
