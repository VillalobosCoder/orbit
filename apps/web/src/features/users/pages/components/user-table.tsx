import { useState } from "react";
import type { UserDto } from "@orbit/shared";

import { useAuth } from "@/context/auth/use-auth";
import { ConfirmDialogComponent } from "@/shared/ui/custom-components/confirm-dialog-component";
import { TableComponent } from "@/shared/ui/custom-components/table-component";
import { useDeleteUser, useGetUsers } from "../../api/queries";
import { createColumns } from "../utils/users-table-columns";

export default function UserTable({
  canWrite,
  onEdit,
}: {
  canWrite: boolean;
  onEdit: (userId: number) => void;
}) {
  const { data, isLoading, error } = useGetUsers();
  const { user } = useAuth();
  const deleteUser = useDeleteUser();
  const [userToDelete, setUserToDelete] = useState<UserDto | null>(null);

  const columns = createColumns({
    currentUserId: user?.id,
    deletingUserId: deleteUser.isPending ? deleteUser.variables : undefined,
    canWrite,
    onEdit: (targetUser) => onEdit(targetUser.id),
    onDelete: setUserToDelete,
  });

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      >
        {error.message}
      </div>
    );
  }

  return (
    <>
      <TableComponent
        data={data ?? []}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Aún no hay usuarios."
      />
      <ConfirmDialogComponent
        open={userToDelete !== null}
        title="¿Eliminar usuario?"
        description={
          <>
            Se eliminará la cuenta de{" "}
            <strong className="font-medium text-foreground">
              {userToDelete?.email}
            </strong>
            . Esta acción no se puede deshacer.
          </>
        }
        confirmLabel="Eliminar usuario"
        pendingLabel="Eliminando..."
        isPending={deleteUser.isPending}
        destructive
        onClose={() => setUserToDelete(null)}
        onConfirm={() => {
          if (!userToDelete) return;
          deleteUser.mutate(userToDelete.id, {
            onSettled: () => setUserToDelete(null),
          });
        }}
      />
    </>
  );
}
