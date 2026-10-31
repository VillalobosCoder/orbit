import {
  BookOpen,
  Bug,
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  ChevronUp,
  Equal,
  ListTree,
  SquareCheckBig,
  type LucideIcon,
} from "lucide-react";
import type { DifficultyDto, IssueTypeDto, PriorityDto } from "@orbit/shared";
import { cn } from "cn";

import { UserAvatarComponent } from "@/components/ui/user-avatar-component";

const TYPE_ICONS: Record<string, { icon: LucideIcon; className: string }> = {
  CheckSquare: { icon: SquareCheckBig, className: "text-type-task" },
  BookOpen: { icon: BookOpen, className: "text-type-story" },
  Bug: { icon: Bug, className: "text-type-bug" },
  ListTree: { icon: ListTree, className: "text-type-subtask" },
};

export function IssueTypeIcon({
  type,
  className,
}: {
  type?: IssueTypeDto;
  className?: string;
}) {
  if (!type) return null;

  const visual =
    TYPE_ICONS[type.icon ?? ""] ??
    (type.isSubtask ? TYPE_ICONS.ListTree : TYPE_ICONS.CheckSquare)!;
  const Icon = visual.icon;

  return (
    <Icon
      role="img"
      aria-label={type.name}
      className={cn("size-4 shrink-0", visual.className, className)}
    />
  );
}

const PRIORITY_ICONS: Record<number, { icon: LucideIcon; className: string }> =
  {
    1: { icon: ChevronsUp, className: "text-priority-urgent" },
    2: { icon: ChevronsUp, className: "text-priority-very-high" },
    3: { icon: ChevronUp, className: "text-priority-high" },
    4: { icon: Equal, className: "text-priority-medium" },
    5: { icon: ChevronDown, className: "text-priority-low" },
    6: { icon: ChevronsDown, className: "text-priority-very-low" },
  };

export function PriorityIcon({
  priority,
  className,
}: {
  priority?: PriorityDto;
  className?: string;
}) {
  if (!priority) return null;

  const visual = PRIORITY_ICONS[priority.level] ?? PRIORITY_ICONS[4]!;
  const Icon = visual.icon;

  return (
    <Icon
      role="img"
      aria-label={`Prioridad ${priority.name.toLowerCase()}`}
      className={cn("size-4 shrink-0", visual.className, className)}
    />
  );
}

export function DifficultyPill({
  difficulty,
}: {
  difficulty?: DifficultyDto;
}) {
  if (!difficulty) return null;

  return (
    <span
      title={`Dificultad ${difficulty.name}`}
      className="rounded-full bg-muted px-2 py-0.5 font-mono text-[0.6875rem] font-medium text-muted-foreground"
    >
      {difficulty.name}
    </span>
  );
}

interface Person {
  id: number;
  name: string;
  lastName: string;
  avatarUrl?: string | null;
}

export function AssigneeStack({
  people,
  max = 3,
}: {
  people: Person[];
  max?: number;
}) {
  if (people.length === 0) {
    return (
      <span
        title="Sin asignar"
        className="inline-flex size-6 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground"
      >
        <span className="sr-only">Sin asignar</span>
        <span aria-hidden="true" className="text-xs">
          –
        </span>
      </span>
    );
  }

  const shown = people.slice(0, max);
  const hidden = people.length - shown.length;

  return (
    <span
      className="flex items-center"
      title={people.map((person) => `${person.name} ${person.lastName}`).join(", ")}
    >
      {shown.map((person) => (
        <UserAvatarComponent
          key={person.id}
          name={`${person.name} ${person.lastName}`}
          avatarUrl={person.avatarUrl}
          className="-ml-1.5 size-6 text-[0.625rem] ring-2 ring-card first:ml-0"
        />
      ))}
      {hidden > 0 && (
        <span className="-ml-1.5 inline-flex size-6 items-center justify-center rounded-full bg-muted text-[0.625rem] font-semibold text-muted-foreground ring-2 ring-card">
          +{hidden}
        </span>
      )}
    </span>
  );
}
