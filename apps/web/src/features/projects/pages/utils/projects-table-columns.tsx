import { NavLink } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import type { DataTableFeatures } from "@/shared/ui/custom-components/table-component";
import type { ProjectDto } from "@orbit/shared";

const columnHelper = createColumnHelper<DataTableFeatures, ProjectDto>();

interface ProjectTableColumnOptions {
  currentUserId?: number;
  canWrite: boolean;
  deletingProjectId?: number;
  onEdit: (project: ProjectDto) => void;
  onDelete: (project: ProjectDto) => void;
}

export function createColumns({
  currentUserId,
  canWrite,
  deletingProjectId,
  onEdit,
  onDelete,
}: ProjectTableColumnOptions) {
  return columnHelper.columns([
    columnHelper.accessor("projectKey", { header: "Clave" }),
    columnHelper.accessor("name", {
      header: "Nombre",
      cell: ({ row }) => (
        <NavLink to={`/projects/${row.original.id}`} className="underline">
          {row.original.name}
        </NavLink>
      ),
    }),
    columnHelper.accessor("description", {
      header: "Descripción",
      cell: ({ getValue }) => getValue() ?? "—",
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const isOwner = row.original.ownerUserId === currentUserId;

        return (
          <div className="flex gap-2">
            {canWrite && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onEdit(row.original)}
              >
                <Pencil aria-hidden="true" />
                Editar
              </Button>
            )}
            {canWrite && isOwner && (
              <Button
                type="button"
                variant="destructive"
                disabled={deletingProjectId === row.original.id}
                onClick={() => onDelete(row.original)}
              >
                <Trash2 aria-hidden="true" />
                {deletingProjectId === row.original.id
                  ? "Eliminando..."
                  : "Eliminar"}
              </Button>
            )}
          </div>
        );
      },
    }),
  ]);
}
