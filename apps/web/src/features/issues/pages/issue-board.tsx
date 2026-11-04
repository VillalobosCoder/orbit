import {
  Fragment,
  useEffect,
  useId,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { useNavigate } from "react-router-dom";

import { Skeleton } from "@/components/ui/skeleton";
import { usePermission } from "@/context/auth/use-permission";
import { useGetProjectMembers } from "@/features/projects/api/queries";
import {
  BoardColumnCategory,
  ModuleKey,
  type BoardDto,
  type IssueDto,
  type ProjectDto,
} from "@orbit/shared";
import { cn } from "cn";
import {
  boardKey,
  useDebouncedMoveIssue,
  useGetBoard,
  useGetIssueOptions,
  useMoveIssue,
} from "../api/queries";
import BoardColumnsDialog from "./board-columns-dialog";
import BoardToolbar from "./components/issue-board/board-toolbar";
import IssueCard, { type KeyboardMoveDirection } from "./components/issue-board/issue-card";
import { ColumnDot } from "./components/shared/issue-visuals";
import { useTouchDrag, type DropTarget } from "./components/issue-board/use-touch-drag";
import { useCoarsePointer } from "@/hooks/use-coarse-pointer";
import IssueDialog from "./issue-dialog";
import { useI18n } from "@/i18n/use-i18n";
import { columnLabel } from "@/i18n/catalog";
import { LoadFailedComponent } from "@/components/ui/load-failed-component";
import { queryClient } from "@/api/tanstack-query-config";

function sortedIssuesIn(
  issues: IssueDto[],
  columnId: number,
  excludeIssueId: number | null = null,
) {
  return issues
    .filter(
      (issue) => issue.columnId === columnId && issue.id !== excludeIssueId,
    )
    .sort((a, b) => a.boardPosition - b.boardPosition || a.id - b.id);
}

export default function IssueBoard({ project }: { project: ProjectDto }) {
  const { t } = useI18n();
  const { canWrite: canWriteIssues } = usePermission(ModuleKey.PROJECT_ISSUES);
  const { canWrite: canMoveIssues } = usePermission(
    ModuleKey.PROJECT_MOVE_ISSUES,
  );
  const { canWrite: canEditColumns } = usePermission(ModuleKey.PROJECT_COLUMNS);
  const board = useGetBoard(project.id);
  const options = useGetIssueOptions(project.id);
  const members = useGetProjectMembers(project.id);
  const moveIssue = useMoveIssue();
  const debouncedMove = useDebouncedMoveIssue();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditingColumns, setIsEditingColumns] = useState(false);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const focusIssueId = useRef<number | null>(null);
  const keyboardHintId = useId();
  const coarsePointer = useCoarsePointer();
  const boardIssues = board.data?.issues;

  useEffect(() => {
    const issueId = focusIssueId.current;

    if (issueId === null) return;

    focusIssueId.current = null;
    document
      .querySelector<HTMLElement>(`[data-issue-id="${issueId}"] button`)
      ?.focus();
  }, [boardIssues]);

  function resetDrag() {
    setDraggingId(null);
    setDropTarget(null);
  }

  function commitMove(
    issueId: number,
    columnId: number,
    beforeIssueId: number | null,
    debounce = false,
  ) {
    const freshIssues =
      queryClient.getQueryData<BoardDto>(boardKey(project.id))?.issues ??
      boardIssues ??
      [];
    const column = sortedIssuesIn(freshIssues, columnId, issueId);
    const beforeIndex =
      beforeIssueId === null
        ? -1
        : column.findIndex((issue) => issue.id === beforeIssueId);
    const index = beforeIndex === -1 ? column.length : beforeIndex;

    const move = {
      id: project.id,
      issueId,
      columnId,
      previousIssueId: column[index - 1]?.id ?? null,
      nextIssueId: column[index]?.id ?? null,
    };

    if (debounce) {
      debouncedMove.schedule(move);
      return;
    }

    debouncedMove.flush();
    moveIssue.mutate(move);
  }

  const touchDrag = useTouchDrag({
    enabled: canMoveIssues,
    getColumnIssueIds: (columnId, excludeIssueId) =>
      sortedIssuesIn(boardIssues ?? [], columnId, excludeIssueId).map(
        (issue) => issue.id,
      ),
    onStart: setDraggingId,
    onTarget: setDropTarget,
    onDrop: (issueId, target) => {
      if (target) commitMove(issueId, target.columnId, target.beforeIssueId);
    },
    onEnd: resetDrag,
  });

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
    return <LoadFailedComponent onRetry={() => void board.refetch()} />;
  }
  if (!board.data) return null;

  const { columns, issues, activeSprint } = board.data;
  const doneColumnIds = new Set(
    columns
      .filter((column) => column.category === BoardColumnCategory.DONE)
      .map((column) => column.id),
  );
  const issuesIn = (columnId: number, withoutDragged = false) =>
    sortedIssuesIn(issues, columnId, withoutDragged ? draggingId : null);
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
    if (draggingId === null || !canMoveIssues) return resetDrag();

    commitMove(draggingId, columnId, dropTarget?.beforeIssueId ?? null);
    resetDrag();
  }

  function handleKeyboardMove(
    issue: IssueDto,
    direction: KeyboardMoveDirection,
  ) {
    if (!canMoveIssues) return;

    const freshBoard = queryClient.getQueryData<BoardDto>(boardKey(project.id));
    const freshIssues = freshBoard?.issues ?? issues;
    const current = freshIssues.find((item) => item.id === issue.id) ?? issue;
    const orderedColumns = [...columns].sort(
      (a, b) => a.position - b.position || a.id - b.id,
    );

    if (direction === "left" || direction === "right") {
      const currentIndex = orderedColumns.findIndex(
        (column) => column.id === current.columnId,
      );
      const target =
        orderedColumns[currentIndex + (direction === "left" ? -1 : 1)];

      if (!target) return;

      const total = sortedIssuesIn(freshIssues, target.id).length + 1;

      commitMove(issue.id, target.id, null, true);
      setAnnouncement(
        t("issues.board.movedToColumn", {
          key: issue.issueKey,
          column: columnLabel(t, target),
          position: total,
          total,
        }),
      );
    } else {
      const list = sortedIssuesIn(freshIssues, current.columnId);
      const index = list.findIndex((item) => item.id === issue.id);
      const targetIndex = index + (direction === "up" ? -1 : 1);

      if (targetIndex < 0 || targetIndex >= list.length) return;

      const beforeIssueId =
        direction === "up"
          ? list[index - 1]!.id
          : (list[index + 2]?.id ?? null);

      commitMove(issue.id, current.columnId, beforeIssueId, true);
      setAnnouncement(
        t("issues.board.reordered", {
          key: issue.issueKey,
          position: targetIndex + 1,
          total: list.length,
        }),
      );
    }

    focusIssueId.current = issue.id;
  }

  const dropIndicator = (
    <li aria-hidden="true" className="h-1 shrink-0 rounded-full bg-primary" />
  );

  return (
    <section
      aria-label={t("issues.board.section")}
      className="flex min-h-0 flex-1 flex-col gap-4"
    >
      <p id={keyboardHintId} className="sr-only">
        {t("issues.board.keyboardHelp")}
      </p>
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
        <BoardToolbar
          projectId={project.id}
          activeSprint={activeSprint}
          canEditColumns={canEditColumns}
          canCreateIssue={canWriteIssues}
          isCreateDisabled={!options.data || !members.data}
          onCreateIssue={() => setIsCreating(true)}
          onEditColumns={() => setIsEditingColumns(true)}
        />

        <div
          data-board-scroll
          className="flex min-h-0 flex-1 gap-4 overflow-x-auto p-4"
        >
          {columns.map((column) => {
            const columnIssues = issuesIn(column.id);
            const isOverLimit =
              column.wipLimit !== null && columnIssues.length > column.wipLimit;
            const isDropColumn =
              draggingId !== null && dropTarget?.columnId === column.id;

            return (
              <div
                key={column.id}
                data-column-id={column.id}
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
                <h3 className="flex min-w-0 shrink-0 items-center gap-2 px-1 pt-0.5 pb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  <ColumnDot column={column} />
                  <span
                    className="min-w-0 truncate"
                    title={columnLabel(t, column)}
                  >
                    {columnLabel(t, column)}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium tracking-normal",
                      isOverLimit && "bg-destructive/15 text-destructive",
                    )}
                  >
                    {columnIssues.length}
                    {column.wipLimit !== null && ` / ${column.wipLimit}`}
                  </span>
                </h3>
                <ul
                  data-column-list
                  className="flex min-h-0 flex-1 flex-col gap-2 overflow-x-hidden overflow-y-auto pr-1"
                >
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
                        draggable={canMoveIssues}
                        nativeDrag={!coarsePointer}
                        isDragging={draggingId === issue.id}
                        keyboardHintId={keyboardHintId}
                        onOpen={() => {
                          if (touchDrag.shouldSuppressClick()) return;

                          navigate(
                            `/projects/${project.id}/issues/${issue.id}`,
                          );
                        }}
                        onTouchStart={(event) =>
                          touchDrag.onTouchStart(event, issue.id)
                        }
                        onKeyboardMove={(direction) =>
                          handleKeyboardMove(issue, direction)
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
                      {t("issues.board.emptyColumn")}
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
