import { Check, ChevronDown } from "lucide-react";
import { cn } from "cn";

import type { UserDto } from "@orbit/shared";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatarComponent } from "@/components/ui/user-avatar-component";

export function UserMultiSelectComponent({
  users,
  values,
  onChange,
  placeholder,
  ariaLabel,
  className,
}: {
  users: UserDto[];
  values: number[];
  onChange: (userIds: number[]) => void;
  placeholder: string;
  ariaLabel: string;
  className?: string;
}) {
  const selected = users.filter((candidate) => values.includes(candidate.id));

  function toggle(userId: number) {
    onChange(
      values.includes(userId)
        ? values.filter((id) => id !== userId)
        : [...values, userId],
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={ariaLabel}
        className={cn(
          "flex min-h-9 w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg border border-input bg-card py-1 pr-3 pl-2 text-left text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 data-popup-open:border-ring",
          className,
        )}
      >
        {selected.length === 0 ? (
          <span className="min-w-0 flex-1 truncate pl-1 text-muted-foreground">
            {placeholder}
          </span>
        ) : selected.length === 1 ? (
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <UserAvatarComponent
              name={`${selected[0].name} ${selected[0].lastName}`}
              avatarUrl={selected[0].avatarUrl}
              className="size-6 text-[0.625rem]"
            />
            <span className="truncate">
              {selected[0].name} {selected[0].lastName}
            </span>
          </span>
        ) : (
          <span className="min-w-0 flex-1 truncate pl-1">
            {selected.length} seleccionados
          </span>
        )}
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={4}
        className="max-h-72 w-(--anchor-width) min-w-64 overflow-y-auto"
      >
        {users.length === 0 ? (
          <p className="px-2.5 py-2 text-sm text-muted-foreground">
            Sin registros
          </p>
        ) : (
          users.map((candidate) => {
            const fullName = `${candidate.name} ${candidate.lastName}`;
            const isSelected = values.includes(candidate.id);

            return (
              <DropdownMenuItem
                key={candidate.id}
                closeOnClick={false}
                className="h-auto py-1.5"
                onClick={() => toggle(candidate.id)}
              >
                <UserAvatarComponent
                  name={fullName}
                  avatarUrl={candidate.avatarUrl}
                  className="size-7 text-[0.625rem]"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {fullName}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {candidate.email}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-input",
                    isSelected &&
                      "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {isSelected && <Check className="size-3" strokeWidth={3} />}
                </span>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
