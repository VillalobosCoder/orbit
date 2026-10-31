import { ChevronDown } from "lucide-react";
import { cn } from "cn";

import type { UserDto } from "@orbit/shared";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatarComponent } from "@/components/ui/user-avatar-component";

export function UserSelectComponent({
  users,
  value,
  onChange,
  placeholder,
  ariaLabel,
  disabled,
  className,
}: {
  users: UserDto[];
  value: number | null;
  onChange: (userId: number) => void;
  placeholder: string;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
}) {
  const selected = users.find((candidate) => candidate.id === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={ariaLabel}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-lg border border-input bg-card pr-3 pl-2 text-left text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60 data-popup-open:border-ring",
          className,
        )}
      >
        {selected ? (
          <>
            <UserAvatarComponent
              name={`${selected.name} ${selected.lastName}`}
              avatarUrl={selected.avatarUrl}
              className="size-6 text-[0.625rem]"
            />
            <span className="min-w-0 flex-1 truncate">
              {selected.name} {selected.lastName}
            </span>
          </>
        ) : (
          <span className="min-w-0 flex-1 truncate pl-1 text-muted-foreground">
            {placeholder}
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

            return (
              <DropdownMenuItem
                key={candidate.id}
                className={cn(candidate.id === value && "bg-accent")}
                onClick={() => onChange(candidate.id)}
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
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
