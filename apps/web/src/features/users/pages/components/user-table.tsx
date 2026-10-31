import { useState } from "react";
import { Search } from "lucide-react";
import type { SortDirection, UserDto, UserSortField } from "@orbit/shared";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PaginationComponent } from "@/components/ui/pagination-component";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
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

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export default function UserTable({
  canWrite,
  onEdit,
}: {
  canWrite: boolean;
  onEdit: (userId: number) => void;
}) {
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState<UserSortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);
  const search = useDebouncedValue(searchText.trim(), SEARCH_DEBOUNCE_MS);
  const { data, isLoading, error } = useGetUsers({
    search,
    sortBy,
    sortDirection,
    page,
    pageSize: PAGE_SIZE,
  });
  const { user } = useAuth();
  const deleteUser = useDeleteUser();
  const resetPassword = useResetUserPassword();
  const [userToDelete, setUserToDelete] = useState<UserDto | null>(null);
  const [userToReset, setUserToReset] = useState<UserDto | null>(null);
  const [resetResult, setResetResult] = useState<{
    user: UserDto;
    password: string;
  } | null>(null);

  function handleSort(field: UserSortField) {
    setPage(1);

    if (field === sortBy) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(field);
    setSortDirection("asc");
  }

  const columns = createColumns({
    sortBy,
    sortDirection,
    onSort: handleSort,
    currentUserId: user?.id,
    deletingUserId: deleteUser.isPending ? deleteUser.variables : undefined,
    canWrite,
    onEdit: (targetUser) => onEdit(targetUser.id),
    onDelete: setUserToDelete,
    onResetPassword: setUserToReset,
  });

  return (
    <>
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error.message}
        </p>
      )}
      {resetPassword.isError && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {resetPassword.error.message}
        </p>
      )}
      <div className="relative max-w-sm">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          value={searchText}
          placeholder="Buscar por nombre o correo"
          aria-label="Buscar usuarios"
          className="pl-9"
          onChange={(event) => {
            setPage(1);
            setSearchText(event.currentTarget.value);
          }}
        />
      </div>
      <TableComponent
        data={data?.items ?? []}
        columns={columns}
        isLoading={isLoading}
        minRows={PAGE_SIZE}
        emptyMessage={search ? "Ningún usuario coincide con la búsqueda." : undefined}
      />
      {data && (
        <PaginationComponent
          page={data.page}
          pageSize={data.pageSize}
          total={data.total}
          onPageChange={setPage}
        />
      )}
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
