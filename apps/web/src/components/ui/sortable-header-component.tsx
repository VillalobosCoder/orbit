import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "cn";

import type { SortDirection } from "@orbit/shared";

export function SortableHeaderComponent({
  label,
  direction,
  onToggle,
}: {
  label: string;
  direction: SortDirection | null;
  onToggle: () => void;
}) {
  const Icon =
    direction === "asc" ? ArrowUp : direction === "desc" ? ArrowDown : ChevronsUpDown;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Ordenar por ${label}`}
      className={cn(
        "-mx-2 inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold tracking-wide uppercase transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40",
        direction ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {label}
      <Icon aria-hidden="true" className="size-3.5" />
    </button>
  );
}
