import { useState, type SubmitEvent } from "react";

import { Button } from "@/components/ui/button";
import { TableComponent } from "@/shared/ui/custom-components/table-component";
import type { DataTableFeatures } from "@/shared/ui/custom-components/table-component";
import type { ProjectDto, ProjectMemberDto } from "@orbit/shared";
import { createColumnHelper } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import {
  useAddProjectMember,
  useGetAvailableUsers,
  useGetProjectMembers,
  useRemoveProjectMember,
} from "../../api/queries";

const columnHelper = createColumnHelper<DataTableFeatures, ProjectMemberDto>();

export default function ProjectMembers({
  project,
  canManage,
}: {
  project: ProjectDto;
  canManage: boolean;
}) {
  const membersQuery = useGetProjectMembers(project.id);
  const availableUsers = useGetAvailableUsers(project.id, { enabled: canManage });
  const addMember = useAddProjectMember();
  const removeMember = useRemoveProjectMember();
  const [selectedUserId, setSelectedUserId] = useState("");

  function handleAdd(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedUserId) return;

    addMember.mutate(
      { id: project.id, userId: Number(selectedUserId) },
      { onSuccess: () => setSelectedUserId("") },
    );
  }

  const columns = columnHelper.columns([
    columnHelper.display({
      id: "fullName",
      header: "Nombre",
      cell: ({ row }) => `${row.original.name} ${row.original.lastName}`,
    }),
    columnHelper.accessor("email", { header: "Correo electrónico" }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: ({ row }) =>
        canManage && row.original.id !== project.ownerUserId ? (
          <Button
            type="button"
            variant="destructive"
            disabled={removeMember.isPending}
            onClick={() =>
              removeMember.mutate({ id: project.id, userId: row.original.id })
            }
          >
            <Trash2 aria-hidden="true" />
            Quitar
          </Button>
        ) : row.original.id === project.ownerUserId ? (
          "Propietario"
        ) : null,
    }),
  ]);

  return (
    <section>
      <h2>Miembros</h2>
      {canManage && (
        <form onSubmit={handleAdd}>
          <label htmlFor="member-select">Agregar miembro</label>{" "}
          <select
            id="member-select"
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(event.currentTarget.value)}
          >
            <option value="">Selecciona un usuario</option>
            {availableUsers.data?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} {user.lastName} ({user.email})
              </option>
            ))}
          </select>{" "}
          <Button
            type="submit"
            variant="outline"
            disabled={!selectedUserId || addMember.isPending}
          >
            {addMember.isPending ? "Agregando..." : "Agregar"}
          </Button>
          {availableUsers.isError && (
            <p role="alert">{availableUsers.error.message}</p>
          )}
          {addMember.isError && <p role="alert">{addMember.error.message}</p>}
        </form>
      )}
      {removeMember.isError && <p role="alert">{removeMember.error.message}</p>}
      {membersQuery.isLoading ? (
        <p>Cargando miembros...</p>
      ) : membersQuery.isError ? (
        <p role="alert">{membersQuery.error.message}</p>
      ) : (
        <TableComponent data={membersQuery.data ?? []} columns={columns} />
      )}
    </section>
  );
}
