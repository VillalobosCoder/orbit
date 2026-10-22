import AddUserDialog from "./components/add-user-dialog";
import UserTable from "./components/user-table";


export default function UsersPage() {
  return (
    <div>
      <h1>Users Page</h1>
      <div>
        <AddUserDialog />
      </div>
      <UserTable />
    </div>
  );
}
