import { TableComponent } from "@/shared/ui/custom-components/table-component";
import { useGetUsers } from "../../api/queries";
import { columns } from "../utils/users-table-columns";

export default function UserTable() {
  const { data, isLoading } = useGetUsers();

  return (
    <>
      {isLoading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <TableComponent data={data || []} columns={columns} />
      )}
    </>
  );
}
