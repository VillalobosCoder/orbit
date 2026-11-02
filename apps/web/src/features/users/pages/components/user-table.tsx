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
import { useI18n } from "@/i18n/use-i18n";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export default function UserTable({
  canWrite,
  onEdit,
}: {
  canWrite: boolean;
  onEdit: (userId: number) => void;
}) {
  const { t } = useI18n();
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
    t,
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
          placeholder={t("users.search.placeholder")}
          aria-label={t("users.search.label")}
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
        emptyMessage={search ? t("users.search.noMatches") : undefined}
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
        title={t("users.deleteDialog.title")}
        description={
          <>
            {t("users.deleteDialog.before")}{" "}
            <strong className="font-medium text-foreground">
              {userToDelete?.email}
            </strong>
            {t("users.deleteDialog.after")}
          </>
        }
        confirmLabel={t("users.deleteDialog.confirm")}
        pendingLabel={t("common.deleting")}
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
        title={t("users.resetDialog.title")}
        description={
          <>
            {t("users.resetDialog.before")}{" "}
            <strong className="font-medium text-foreground">
              {userToReset?.email}
            </strong>
            {t("users.resetDialog.after")}
          </>
        }
        confirmLabel={t("users.resetDialog.confirm")}
        pendingLabel={t("users.resetDialog.pending")}
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
              title={t("users.resetDone.title")}
              description={t("users.resetDone.description", {
                name: `${resetResult.user.name} ${resetResult.user.lastName}`,
              })}
              password={resetResult.password}
              onClose={() => setResetResult(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
