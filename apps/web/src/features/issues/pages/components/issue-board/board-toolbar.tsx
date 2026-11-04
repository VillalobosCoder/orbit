import { NavLink } from "react-router-dom";
import { Columns3, Plus } from "lucide-react";
import type { SprintDto } from "@orbit/shared";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { getLocale, t as translateNow } from "@/i18n/locale-store";
import { useI18n } from "@/i18n/use-i18n";
import { describeDays } from "@/features/sprints/pages/utils/format-date";

function describeEndDate(endDate: string) {
  const [year, month, day] = endDate.split("-").map(Number);
  const end = new Date(year!, month! - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.round((end.getTime() - today.getTime()) / 86_400_000);
  const formatted = end.toLocaleDateString(getLocale(), {
    day: "numeric",
    month: "short",
    year: end.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });

  return translateNow("dates.until", {
    date: formatted,
    remaining: describeDays(daysLeft),
  });
}

interface BoardToolbarProps {
  projectId: number;
  activeSprint: SprintDto | null;
  canEditColumns: boolean;
  canCreateIssue: boolean;
  isCreateDisabled: boolean;
  onCreateIssue: () => void;
  onEditColumns: () => void;
}

export default function BoardToolbar({
  projectId,
  activeSprint,
  canEditColumns,
  canCreateIssue,
  isCreateDisabled,
  onCreateIssue,
  onEditColumns,
}: BoardToolbarProps) {
  const { t } = useI18n();

  return (
    <div
      className={cn(
        "flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-3",
        activeSprint
          ? "border-info/40 bg-linear-to-r from-info/12 via-card to-card"
          : "border-border",
      )}
    >
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        {activeSprint ? (
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-info/15 px-2.5 py-0.5 text-xs font-medium text-info">
              <span
                className="size-1.5 rounded-full bg-info shadow-[0_0_8px_var(--info)]"
                aria-hidden="true"
              />
              {t("issues.board.activeSprint")}
            </span>
            <strong className="text-[0.9375rem] font-semibold">
              {activeSprint.name}
            </strong>
            {activeSprint.endDate && (
              <span className="text-muted-foreground">
                {describeEndDate(activeSprint.endDate)}
              </span>
            )}
          </>
        ) : (
          <span className="text-muted-foreground">
            {t("issues.board.noActiveSprint")}
          </span>
        )}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          nativeButton={false}
          render={<NavLink to={`/projects/${projectId}/planning`} />}
        >
          {t("issues.board.planning")}
        </Button>
        {canEditColumns && (
          <Button
            type="button"
            variant="outline"
            onClick={onEditColumns}
          >
            <Columns3 />
            {t("issues.board.columns")}
          </Button>
        )}
        {canCreateIssue && (
          <Button
            type="button"
            disabled={isCreateDisabled}
            onClick={onCreateIssue}
          >
            <Plus />
            {t("issues.board.newIssue")}
          </Button>
        )}
      </div>
    </div>
  );
}
