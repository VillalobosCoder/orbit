import { TableComponent } from "@/shared/ui/custom-components/table-component";
import { useDeleteUser, useGetUsers } from "../../api/queries";
import { useAuth } from "@/context/auth/use-auth";
import { createColumns } from "../utils/users-table-columns";
import type { UserDto } from "@orbit/shared";

export default function UserTable() {
  const { data, isLoading, error } = useGetUsers();
  const { user } = useAuth();
  const deleteUser = useDeleteUser();

  const onDelete = (targetUser: UserDto) => {
    const fullName = `${targetUser.name} ${targetUser.lastName}`;
    if (window.confirm(`¿Seguro que quieres eliminar a ${fullName}?`)) {
      deleteUser.mutate(targetUser.id);
    }
  };

  const columns = createColumns({
    currentUserId: user?.id,
    deletingUserId: deleteUser.isPending ? deleteUser.variables : undefined,
    onDelete,
  });

  return (
    <>
      {isLoading ? (
        <p>Cargando usuarios...</p>
      ) : error ? (
        <p role="alert">{error.message}</p>
      ) : (
        <TableComponent data={data ?? []} columns={columns} />
      )}
    </>
  );
}
