import { Button } from "@/components/ui/button";
import type { DataTableFeatures } from "@/shared/ui/custom-components/table-component";
import type { UserDto } from "@orbit/shared";
import { createColumnHelper } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";

const columnHelper = createColumnHelper<DataTableFeatures, UserDto>();

interface UserTableColumnOptions {
  currentUserId?: number;
  deletingUserId?: number;
  onDelete: (user: UserDto) => void;
}

export function createColumns({
  currentUserId,
  deletingUserId,
  onDelete,
}: UserTableColumnOptions) {
  return columnHelper.columns([
    columnHelper.accessor("name", { header: "Nombre" }),
    columnHelper.accessor("lastName", { header: "Apellido" }),
    columnHelper.accessor("email", { header: "Correo electrónico" }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: ({ row }) =>
        currentUserId !== undefined && row.original.id !== currentUserId ? (
          <Button
            type="button"
            variant="destructive"
            disabled={deletingUserId === row.original.id}
            onClick={() => onDelete(row.original)}
          >
            <Trash2 aria-hidden="true" />
            {deletingUserId === row.original.id
              ? "Eliminando..."
              : "Eliminar"}
          </Button>
        ) : null,
    }),
  ]);
}
