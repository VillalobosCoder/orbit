import { KeyRound, Pencil, Trash2 } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import type { SortDirection, UserDto, UserSortField } from "@orbit/shared";

import { Button } from "@/components/ui/button";
import type { DataTableFeatures } from "@/components/ui/table-component";
import { SortableHeaderComponent } from "@/components/ui/sortable-header-component";
import { UserAvatarComponent } from "@/components/ui/user-avatar-component";

const columnHelper = createColumnHelper<DataTableFeatures, UserDto>();

interface UserTableColumnOptions {
  sortBy: UserSortField;
  sortDirection: SortDirection;
  onSort: (field: UserSortField) => void;
  currentUserId?: number;
  deletingUserId?: number;
  canWrite: boolean;
  onEdit: (user: UserDto) => void;
  onDelete: (user: UserDto) => void;
  onResetPassword: (user: UserDto) => void;
}

export function createColumns({
  sortBy,
  sortDirection,
  onSort,
  currentUserId,
  deletingUserId,
  canWrite,
  onEdit,
  onDelete,
  onResetPassword,
}: UserTableColumnOptions) {
  const columns = [
    columnHelper.display({
      id: "fullName",
      header: () => (
        <SortableHeaderComponent
          label="Usuario"
          direction={sortBy === "name" ? sortDirection : null}
          onToggle={() => onSort("name")}
        />
      ),
      cell: ({ row }) => {
        const fullName = `${row.original.name} ${row.original.lastName}`;

        return (
          <div className="flex items-center gap-3">
            <UserAvatarComponent
              name={fullName}
              avatarUrl={row.original.avatarUrl}
            />
            <span className="font-medium">
              {fullName}
              {row.original.id === currentUserId && (
                <span className="ml-1.5 font-normal text-muted-foreground">
                  (tú)
                </span>
              )}
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor("email", {
      header: () => (
        <SortableHeaderComponent
          label="Correo electrónico"
          direction={sortBy === "email" ? sortDirection : null}
          onToggle={() => onSort("email")}
        />
      ),
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">{getValue()}</span>
      ),
    }),
  ];

  if (canWrite) {
    columns.push(
      columnHelper.display({
        id: "actions",
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Editar a ${row.original.name} ${row.original.lastName}`}
              title="Editar y permisos"
              onClick={() => onEdit(row.original)}
            >
              <Pencil />
            </Button>
            {currentUserId !== undefined &&
              row.original.id !== currentUserId && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Restablecer la contraseña de ${row.original.name} ${row.original.lastName}`}
                    title="Restablecer contraseña"
                    onClick={() => onResetPassword(row.original)}
                  >
                    <KeyRound />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Eliminar a ${row.original.name} ${row.original.lastName}`}
                    title="Eliminar"
                    disabled={deletingUserId === row.original.id}
                    onClick={() => onDelete(row.original)}
                  >
                    <Trash2 />
                  </Button>
                </>
              )}
          </div>
        ),
      }),
    );
  }

  return columnHelper.columns(columns);
}
