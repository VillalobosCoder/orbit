import { useState } from "react";
import type { UserDto } from "@orbit/shared";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/context/auth/use-auth";
import { ConfirmDialogComponent } from "@/components/ui/confirm-dialog-component";
import { TableComponent } from "@/components/ui/table-component";
import {
  useDeleteUser,
  useGetUsers,
  useResetUserPassword,
} from "../../api/queries";
import { createColumns } from "../utils/users-table-columns";
import TemporaryPassword from "./temporary-password";

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
  const resetPassword = useResetUserPassword();
  const [userToDelete, setUserToDelete] = useState<UserDto | null>(null);
  const [userToReset, setUserToReset] = useState<UserDto | null>(null);
  const [resetResult, setResetResult] = useState<{
    user: UserDto;
    password: string;
  } | null>(null);

  const columns = createColumns({
    currentUserId: user?.id,
    deletingUserId: deleteUser.isPending ? deleteUser.variables : undefined,
    canWrite,
    onEdit: (targetUser) => onEdit(targetUser.id),
    onDelete: setUserToDelete,
    onResetPassword: setUserToReset,
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
      {resetPassword.isError && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {resetPassword.error.message}
        </p>
      )}
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
      <ConfirmDialogComponent
        open={userToReset !== null}
        title="¿Restablecer la contraseña?"
        description={
          <>
            Se generará una contraseña temporal para{" "}
            <strong className="font-medium text-foreground">
              {userToReset?.email}
            </strong>
            . La actual dejará de funcionar y la persona deberá cambiarla al
            volver a entrar.
          </>
        }
        confirmLabel="Restablecer contraseña"
        pendingLabel="Restableciendo..."
        isPending={resetPassword.isPending}
        onClose={() => setUserToReset(null)}
        onConfirm={() => {
          if (!userToReset) return;
          const target = userToReset;
          resetPassword.mutate(target.id, {
            onSuccess: (result) => {
              if (result) {
                setResetResult({ user: target, password: result.temporaryPassword });
              }
            },
            onSettled: () => setUserToReset(null),
          });
        }}
      />
      <Dialog
        open={resetResult !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setResetResult(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          {resetResult && (
            <TemporaryPassword
              title="Contraseña restablecida"
              description={`Comparte esta contraseña temporal con ${resetResult.user.name} ${resetResult.user.lastName}. No se volverá a mostrar después de cerrar este diálogo.`}
              password={resetResult.password}
              onClose={() => setResetResult(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
