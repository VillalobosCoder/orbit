import { Button } from "@/components/ui/button";
import type { DataTableFeatures } from "@/shared/ui/custom-components/table-component";
import type { UserDto } from "@orbit/shared";
import { createColumnHelper } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

const columnHelper = createColumnHelper<DataTableFeatures, UserDto>();

interface UserTableColumnOptions {
  currentUserId?: number;
  deletingUserId?: number;
  onEdit: (user: UserDto) => void;
  onDelete: (user: UserDto) => void;
}

export function createColumns({
  currentUserId,
  deletingUserId,
  onEdit,
  onDelete,
}: UserTableColumnOptions) {
  return columnHelper.columns([
    columnHelper.accessor("name", { header: "Nombre" }),
    columnHelper.accessor("lastName", { header: "Apellido" }),
    columnHelper.accessor("email", { header: "Correo electrónico" }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onEdit(row.original)}
          >
            <Pencil aria-hidden="true" />
            Editar
          </Button>
          {currentUserId !== undefined && row.original.id !== currentUserId ? (
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
          ) : null}
        </div>
      ),
    }),
  ]);
}
