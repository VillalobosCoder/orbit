import type { DragEvent } from "react";
import { CornerDownRight, ListTree } from "lucide-react";
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
} from "./issue-visuals";

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
  isDragging: boolean;
  onOpen: () => void;
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
  isDragging,
  onOpen,
  onDragStart,
  onDragEnd,
  onDragOver,
}: IssueCardProps) {
  return (
    <li
      draggable={draggable}
      className={cn(
        "rounded-xl border border-border bg-card shadow-xs transition-colors hover:border-primary/60",
        draggable && "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full flex-col gap-3 rounded-xl p-3 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {parentKey && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <CornerDownRight className="size-3" aria-hidden="true" />
            Subtarea de {parentKey}
          </span>
        )}
        <span className="leading-snug font-medium">{issue.title}</span>
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
          <DifficultyPill difficulty={difficulty} />
          <PriorityIcon priority={priority} />
          <AssigneeStack people={assignees} />
        </span>
      </button>
    </li>
  );
}
