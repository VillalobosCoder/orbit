import { Fragment, useState, type DragEvent } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Columns3, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermission } from "@/context/auth/use-permission";
import { useGetProjectMembers } from "@/features/projects/api/queries";
import {
  BoardColumnCategory,
  type BoardColumnDto,
  type IssueDto,
  type ProjectDto,
} from "@orbit/shared";
import { cn } from "cn";
import {
  useGetBoard,
  useGetIssueOptions,
  useMoveIssue,
} from "../../api/queries";
import BoardColumnsDialog from "./board-columns-dialog";
import IssueCard from "./issue-card";
import IssueDialog from "./issue-dialog";

type DropTarget = { columnId: number; beforeIssueId: number | null };

const CATEGORY_DOT: Record<BoardColumnCategory, string> = {
  [BoardColumnCategory.TODO]: "bg-muted-foreground",
  [BoardColumnCategory.IN_PROGRESS]: "bg-primary",
  [BoardColumnCategory.DONE]: "bg-success",
};

function describeEndDate(endDate: string) {
  const [year, month, day] = endDate.split("-").map(Number);
  const end = new Date(year!, month! - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.round((end.getTime() - today.getTime()) / 86_400_000);
  const formatted = end.toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: end.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
  const remaining =
    daysLeft < 0
      ? "vencido"
      : daysLeft === 0
        ? "termina hoy"
        : daysLeft === 1
          ? "1 día"
          : `${daysLeft} días`;

  return `hasta ${formatted} · ${remaining}`;
}

function ColumnDot({ column }: { column: BoardColumnDto }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "size-2 rounded-full",
        !column.color && CATEGORY_DOT[column.category],
      )}
      style={column.color ? { backgroundColor: column.color } : undefined}
    />
  );
}

export default function IssueBoard({ project }: { project: ProjectDto }) {
  const { canWrite } = usePermission("projects");
  const board = useGetBoard(project.id);
  const options = useGetIssueOptions(project.id);
  const members = useGetProjectMembers(project.id);
  const moveIssue = useMoveIssue();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditingColumns, setIsEditingColumns] = useState(false);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  if (board.isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden" aria-busy="true">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-64 w-72 shrink-0 rounded-xl" />
        ))}
      </div>
    );
  }
  if (board.isError) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      >
        {board.error.message}
      </p>
    );
  }
  if (!board.data) return null;

  const { columns, issues, activeSprint } = board.data;
  const doneColumnIds = new Set(
    columns
      .filter((column) => column.category === BoardColumnCategory.DONE)
      .map((column) => column.id),
  );
  const issuesIn = (columnId: number, withoutDragged = false) =>
    issues
      .filter(
        (issue) =>
          issue.columnId === columnId &&
          !(withoutDragged && issue.id === draggingId),
      )
      .sort((a, b) => a.boardPosition - b.boardPosition || a.id - b.id);
  const parentKey = (issue: IssueDto) =>
    issues.find((candidate) => candidate.id === issue.parentId)?.issueKey;
  const subtasksOf = (issue: IssueDto) => {
    const children = issues.filter(
      (candidate) => candidate.parentId === issue.id,
    );

    return {
      total: children.length,
      done: children.filter((child) => doneColumnIds.has(child.columnId))
        .length,
    };
  };
  const assigneesOf = (issue: IssueDto) =>
    issue.assigneeIds
      .map((userId) => members.data?.find((member) => member.id === userId))
      .filter((member) => member !== undefined);

  function resetDrag() {
    setDraggingId(null);
    setDropTarget(null);
  }

  function handleCardDragOver(event: DragEvent<HTMLElement>, issue: IssueDto) {
    event.preventDefault();
    event.stopPropagation();

    if (issue.id === draggingId) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const isLowerHalf = event.clientY >= rect.top + rect.height / 2;
    const column = issuesIn(issue.columnId, true);
    const following =
      column[column.findIndex((item) => item.id === issue.id) + 1];

    setDropTarget({
      columnId: issue.columnId,
      beforeIssueId: isLowerHalf ? (following?.id ?? null) : issue.id,
    });
  }

  function handleDrop(columnId: number) {
    if (draggingId === null || !canWrite) return resetDrag();

    const column = issuesIn(columnId, true);
    const beforeIndex = column.findIndex(
      (issue) => issue.id === dropTarget?.beforeIssueId,
    );
    const index = beforeIndex === -1 ? column.length : beforeIndex;

    moveIssue.mutate({
      id: project.id,
      issueId: draggingId,
      columnId,
      previousIssueId: column[index - 1]?.id ?? null,
      nextIssueId: column[index]?.id ?? null,
    });
    resetDrag();
  }

  const dropIndicator = (
    <li aria-hidden="true" className="h-1 shrink-0 rounded-full bg-primary" />
  );

  return (
    <section
      aria-label="Tablero"
      className="flex min-h-0 flex-1 flex-col gap-4"
    >
      {moveIssue.isError && (
        <p
          role="alert"
          className="shrink-0 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {moveIssue.error.message}
        </p>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
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
                  Sprint activo
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
                Sin sprint activo: se muestran los issues del backlog.
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              nativeButton={false}
              render={<NavLink to={`/projects/${project.id}/planning`} />}
            >
              Planificación
            </Button>
            {canWrite && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditingColumns(true)}
              >
                <Columns3 />
                Columnas
              </Button>
            )}
            {canWrite && (
              <Button
                type="button"
                disabled={!options.data || !members.data}
                onClick={() => setIsCreating(true)}
              >
                <Plus />
                Nuevo issue
              </Button>
            )}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto p-4">
          {columns.map((column) => {
            const columnIssues = issuesIn(column.id);
            const isOverLimit =
              column.wipLimit !== null && columnIssues.length > column.wipLimit;
            const isDropColumn =
              draggingId !== null && dropTarget?.columnId === column.id;

            return (
              <div
                key={column.id}
                className={cn(
                  "flex h-full min-h-40 w-72 shrink-0 flex-col gap-2 rounded-xl border bg-muted/40 p-2.5 transition-colors",
                  isDropColumn
                    ? "border-primary bg-primary/5"
                    : "border-border",
                )}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDropTarget({ columnId: column.id, beforeIssueId: null });
                }}
                onDrop={() => handleDrop(column.id)}
              >
                <h3 className="flex items-center gap-2 px-1 pt-0.5 pb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  <ColumnDot column={column} />
                  {column.name}
                  <span
                    className={cn(
                      "rounded-full bg-muted px-2 py-0.5 text-xs font-medium tracking-normal",
                      isOverLimit && "bg-destructive/15 text-destructive",
                    )}
                  >
                    {columnIssues.length}
                    {column.wipLimit !== null && ` / ${column.wipLimit}`}
                  </span>
                </h3>
                <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
                  {columnIssues.map((issue) => (
                    <Fragment key={issue.id}>
                      {isDropColumn &&
                        dropTarget?.beforeIssueId === issue.id &&
                        dropIndicator}
                      <IssueCard
                        issue={issue}
                        type={options.data?.issueTypes.find(
                          (type) => type.id === issue.typeId,
                        )}
                        priority={options.data?.priorities.find(
                          (priority) => priority.id === issue.priorityId,
                        )}
                        difficulty={options.data?.difficulties.find(
                          (difficulty) => difficulty.id === issue.difficultyId,
                        )}
                        assignees={assigneesOf(issue)}
                        parentKey={parentKey(issue)}
                        subtasks={subtasksOf(issue)}
                        draggable={canWrite}
                        isDragging={draggingId === issue.id}
                        onOpen={() =>
                          navigate(`/projects/${project.id}/issues/${issue.id}`)
                        }
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData(
                            "text/plain",
                            String(issue.id),
                          );
                          setDraggingId(issue.id);
                        }}
                        onDragEnd={resetDrag}
                        onDragOver={(event) => handleCardDragOver(event, issue)}
                      />
                    </Fragment>
                  ))}
                  {isDropColumn &&
                    dropTarget?.beforeIssueId === null &&
                    dropIndicator}
                  {columnIssues.length === 0 && !isDropColumn && (
                    <li className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                      Sin issues en esta columna
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {isCreating && options.data && members.data && (
        <IssueDialog
          project={project}
          options={options.data}
          columns={columns}
          issues={issues}
          sprints={activeSprint ? [activeSprint] : []}
          defaultSprintId={activeSprint?.id ?? null}
          members={members.data}
          onClose={() => setIsCreating(false)}
        />
      )}
      {isEditingColumns && (
        <BoardColumnsDialog
          project={project}
          columns={columns}
          onClose={() => setIsEditingColumns(false)}
        />
      )}
    </section>
  );
}
