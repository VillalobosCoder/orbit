import type { DragEvent, TouchEvent } from "react";
import { CalendarClock, CornerDownRight, ListTree } from "lucide-react";
import type {
  DifficultyDto,
  IssueDto,
  IssueTypeDto,
  PriorityDto,
} from "@orbit/shared";
import { cn } from "cn";

import {
  AssigneeStack,
  DifficultyPill,
  IssueTypeIcon,
  PriorityIcon,
} from "../shared/issue-visuals";
import { useI18n } from "@/i18n/use-i18n";
import { formatDate, getDueState } from "../../../utils/due-date";

export type KeyboardMoveDirection = "left" | "right" | "up" | "down";

const KEY_DIRECTIONS: Record<string, KeyboardMoveDirection | undefined> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
};

interface IssueCardProps {
  issue: IssueDto;
  type?: IssueTypeDto;
  priority?: PriorityDto;
  difficulty?: DifficultyDto;
  assignees: {
    id: number;
    name: string;
    lastName: string;
    avatarUrl?: string | null;
  }[];
  parentKey?: string;
  subtasks: { done: number; total: number };
  draggable: boolean;
  nativeDrag: boolean;
  isDragging: boolean;
  keyboardHintId: string;
  onOpen: () => void;
  onTouchStart: (event: TouchEvent<HTMLElement>) => void;
  onKeyboardMove: (direction: KeyboardMoveDirection) => void;
  onDragStart: (event: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
}

export default function IssueCard({
  issue,
  type,
  priority,
  difficulty,
  assignees,
  parentKey,
  subtasks,
  draggable,
  nativeDrag,
  isDragging,
  keyboardHintId,
  onOpen,
  onTouchStart,
  onKeyboardMove,
  onDragStart,
  onDragEnd,
  onDragOver,
}: IssueCardProps) {
  const { t, locale } = useI18n();
  const dueState = getDueState(issue.dueDate, issue.resolvedAt !== null);

  return (
    <li
      data-issue-id={issue.id}
      draggable={draggable && nativeDrag}
      className={cn(
        "min-w-0 rounded-xl border border-border bg-card shadow-xs transition-colors hover:border-primary/60",
        draggable &&
          "cursor-grab select-none active:cursor-grabbing [-webkit-touch-callout:none]",
        isDragging && "opacity-40",
      )}
      onTouchStart={onTouchStart}
      onContextMenu={(event) => {
        const nativeEvent = event.nativeEvent as PointerEvent;

        if (draggable && nativeEvent.pointerType === "touch") {
          event.preventDefault();
        }
      }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-describedby={draggable ? keyboardHintId : undefined}
        aria-keyshortcuts={draggable ? "Alt+ArrowLeft Alt+ArrowRight Alt+ArrowUp Alt+ArrowDown" : undefined}
        onKeyDown={(event) => {
          if (!draggable || !event.altKey) return;

          const direction = KEY_DIRECTIONS[event.key];

          if (!direction) return;

          event.preventDefault();
          onKeyboardMove(direction);
        }}
        className="flex w-full min-w-0 flex-col gap-3 overflow-hidden rounded-xl p-3 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {parentKey && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <CornerDownRight className="size-3" aria-hidden="true" />
            {t("issues.board.subtaskOf", { key: parentKey })}
          </span>
        )}
        <span
          title={issue.title}
          className="line-clamp-2 leading-snug font-medium [overflow-wrap:anywhere]"
        >
          {issue.title}
        </span>
        {dueState && issue.dueDate && (
          <span
            className={cn(
              "flex w-fit items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium",
              dueState === "overdue"
                ? "bg-destructive/10 text-destructive"
                : "bg-warning/15 text-warning",
            )}
          >
            <CalendarClock className="size-3" aria-hidden="true" />
            {formatDate(issue.dueDate, locale)}
          </span>
        )}
        <span className="flex items-center gap-2">
          <IssueTypeIcon type={type} />
          <span className="font-mono text-xs text-muted-foreground">
            {issue.issueKey}
          </span>
          {subtasks.total > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <ListTree className="size-3" aria-hidden="true" />
              {subtasks.done}/{subtasks.total}
            </span>
          )}
          <span className="flex-1" />
          {issue.storyPoints !== null && (
            <span
              title={t("issues.board.storyPoints", { count: issue.storyPoints })}
              className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground"
            >
              {issue.storyPoints}
            </span>
          )}
          <DifficultyPill difficulty={difficulty} />
          <PriorityIcon priority={priority} />
          <AssigneeStack people={assignees} />
        </span>
      </button>
    </li>
  );
}
