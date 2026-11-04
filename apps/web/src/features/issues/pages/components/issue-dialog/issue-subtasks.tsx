import { NavLink } from "react-router-dom";
import { Circle, CircleCheck, Plus } from "lucide-react";
import {
  BoardColumnCategory,
  type BoardColumnDto,
  type IssueDto,
} from "@orbit/shared";

import { Button } from "@/components/ui/button";
import { columnLabel } from "@/i18n/catalog";
import { useI18n } from "@/i18n/use-i18n";

interface IssueSubtasksProps {
  projectId: number;
  subtasks: IssueDto[];
  columns: BoardColumnDto[];
  canAdd: boolean;
  onAdd: () => void;
}

export default function IssueSubtasks({
  projectId,
  subtasks,
  columns,
  canAdd,
  onAdd,
}: IssueSubtasksProps) {
  const { t } = useI18n();
  const isDone = (item: IssueDto) =>
    columns.find((col) => col.id === item.columnId)?.category ===
    BoardColumnCategory.DONE;
  const doneSubtasks = subtasks.filter(isDone);
  const subtaskColumn = (columnId: number) => {
    const subtaskColumnData = columns.find((col) => col.id === columnId);

    return subtaskColumnData ? columnLabel(t, subtaskColumnData) : "";
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="flex items-baseline gap-2 text-sm font-semibold">
          {t("issues.dialog.subtasks")}
          {subtasks.length > 0 && (
            <span className="text-xs font-normal text-muted-foreground">
              {t("issues.dialog.subtasksDone", {
                done: doneSubtasks.length,
                total: subtasks.length,
              })}
            </span>
          )}
        </h2>
      </div>
      {subtasks.length > 0 && (
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={subtasks.length}
          aria-valuenow={doneSubtasks.length}
          aria-label={t("issues.dialog.subtasksProgress")}
          className="h-1.5 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-success transition-[width]"
            style={{
              width: `${(doneSubtasks.length / subtasks.length) * 100}%`,
            }}
          />
        </div>
      )}
      <ul className="flex flex-col gap-1.5">
        {subtasks.map((subtask) => (
          <li key={subtask.id}>
            <NavLink
              to={`/projects/${projectId}/issues/${subtask.id}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:border-primary/60"
            >
              {isDone(subtask) ? (
                <CircleCheck
                  className="size-4 shrink-0 text-success"
                  aria-label={t("issues.dialog.completed")}
                />
              ) : (
                <Circle
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-label={t("issues.dialog.pending")}
                />
              )}
              <span className="font-mono text-xs text-muted-foreground">
                {subtask.issueKey}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">
                {subtask.title}
              </span>
              <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs">
                {subtaskColumn(subtask.columnId)}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
      {canAdd && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => onAdd()}
        >
          <Plus />
          {t("issues.dialog.newSubtask")}
        </Button>
      )}
    </section>
  );
}
