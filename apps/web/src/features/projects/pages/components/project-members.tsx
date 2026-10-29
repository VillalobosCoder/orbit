import { useState, type SubmitEvent } from "react";
import { CircleAlert, Trash2, UserPlus } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import type { ProjectDto, ProjectMemberDto } from "@orbit/shared";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { useAuth } from "@/context/auth/use-auth";
import { ConfirmDialogComponent } from "@/shared/ui/custom-components/confirm-dialog-component";
import { TableComponent } from "@/shared/ui/custom-components/table-component";
import type { DataTableFeatures } from "@/shared/ui/custom-components/table-component";
import { UserAvatarComponent } from "@/shared/ui/custom-components/user-avatar-component";
import {
  useAddProjectMember,
  useGetAvailableUsers,
  useGetProjectMembers,
  useRemoveProjectMember,
} from "../../api/queries";

const columnHelper = createColumnHelper<DataTableFeatures, ProjectMemberDto>();

function ErrorAlert({ children }: { children: string }) {
  return (
    <p
      role="alert"
      className="flex items-center gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
    >
      <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}

export default function ProjectMembers({
  project,
  canManage,
}: {
  project: ProjectDto;
  canManage: boolean;
}) {
  const { user } = useAuth();
  const membersQuery = useGetProjectMembers(project.id);
  const availableUsers = useGetAvailableUsers(project.id, { enabled: canManage });
  const addMember = useAddProjectMember();
  const removeMember = useRemoveProjectMember();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [memberToRemove, setMemberToRemove] = useState<ProjectMemberDto | null>(
    null,
  );

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
      header: "Miembro",
      cell: ({ row }) => {
        const fullName = `${row.original.name} ${row.original.lastName}`;

        return (
          <div className="flex items-center gap-3">
            <UserAvatarComponent name={fullName} />
            <span className="font-medium">
              {fullName}
              {row.original.id === user?.id && (
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
      header: "Correo electrónico",
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">{getValue()}</span>
      ),
    }),
    columnHelper.display({
      id: "role",
      header: "Rol",
      cell: ({ row }) =>
        row.original.id === project.ownerUserId ? (
          <Badge variant="primary">Propietario</Badge>
        ) : (
          <Badge>Miembro</Badge>
        ),
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span className="sr-only">Acciones</span>,
      cell: ({ row }) =>
        canManage && row.original.id !== project.ownerUserId ? (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Quitar a ${row.original.name} ${row.original.lastName}`}
              title="Quitar del proyecto"
              onClick={() => setMemberToRemove(row.original)}
            >
              <Trash2 />
            </Button>
          </div>
        ) : null,
    }),
  ]);

  return (
    <section
      aria-label="Miembros del proyecto"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="max-w-md text-sm text-muted-foreground">
          Solo los miembros ven este proyecto.
          {canManage
            ? " Tú, como propietario, decides quién entra y quién sale."
            : " El propietario gestiona quién entra y quién sale."}
        </p>
        {canManage && (
          <form onSubmit={handleAdd} className="flex items-end gap-2">
            <div className="flex w-72 flex-col gap-1.5">
              <Label htmlFor="member-select" className="text-muted-foreground">
                Agregar miembro
              </Label>
              <NativeSelect
                id="member-select"
                value={selectedUserId}
                onChange={(event) => setSelectedUserId(event.currentTarget.value)}
              >
                <option value="">Selecciona un usuario</option>
                {availableUsers.data?.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name} {candidate.lastName} ({candidate.email})
                  </option>
                ))}
              </NativeSelect>
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={!selectedUserId || addMember.isPending}
            >
              <UserPlus />
              {addMember.isPending ? "Agregando..." : "Agregar"}
            </Button>
          </form>
        )}
      </div>

      {availableUsers.isError && (
        <ErrorAlert>{availableUsers.error.message}</ErrorAlert>
      )}
      {addMember.isError && <ErrorAlert>{addMember.error.message}</ErrorAlert>}
      {removeMember.isError && (
        <ErrorAlert>{removeMember.error.message}</ErrorAlert>
      )}

      {membersQuery.isError ? (
        <ErrorAlert>{membersQuery.error.message}</ErrorAlert>
      ) : (
        <TableComponent
          data={membersQuery.data ?? []}
          columns={columns}
          isLoading={membersQuery.isLoading}
          emptyMessage="Este proyecto aún no tiene miembros."
        />
      )}

      <ConfirmDialogComponent
        open={memberToRemove !== null}
        title="¿Quitar del proyecto?"
        description={
          <>
            <strong className="font-medium text-foreground">
              {memberToRemove?.name} {memberToRemove?.lastName}
            </strong>{" "}
            dejará de ver el proyecto{" "}
            <strong className="font-medium text-foreground">
              {project.projectKey}
            </strong>
            .
          </>
        }
        confirmLabel="Quitar del proyecto"
        pendingLabel="Quitando..."
        isPending={removeMember.isPending}
        destructive
        onClose={() => setMemberToRemove(null)}
        onConfirm={() => {
          if (!memberToRemove) return;
          removeMember.mutate(
            { id: project.id, userId: memberToRemove.id },
            { onSettled: () => setMemberToRemove(null) },
          );
        }}
      />
    </section>
  );
}
