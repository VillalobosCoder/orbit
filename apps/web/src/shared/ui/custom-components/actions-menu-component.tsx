import { Ellipsis, type LucideIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "cn";

export interface ActionsMenuItem {
  label: string;
  icon?: LucideIcon;
  onSelect: () => void;
  variant?: "default" | "destructive";
  hidden?: boolean;
  disabled?: boolean;
}

export function ActionsMenuComponent({
  items,
  label = "Acciones",
}: {
  items: ActionsMenuItem[];
  label?: string;
}) {
  const visibleItems = items.filter((item) => !item.hidden);

  if (visibleItems.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={label}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "cursor-pointer data-popup-open:bg-accent",
        )}
      >
        <Ellipsis />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4} className="min-w-48">
        {visibleItems.map(({ label: itemLabel, icon: Icon, ...item }) => (
          <DropdownMenuItem
            key={itemLabel}
            variant={item.variant}
            disabled={item.disabled}
            onClick={item.onSelect}
          >
            {Icon && <Icon />}
            {itemLabel}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
