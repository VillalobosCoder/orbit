import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth/use-auth";
import UserFormDialog from "./components/user-form-dialog";
import UserTable from "./components/user-table";

type DialogState = { userId?: number } | null;

export default function UsersPage() {
  const { user } = useAuth();
  const [dialog, setDialog] = useState<DialogState>(null);

  return (
    <div>
      <h1>Users Page</h1>
      <div>
        <Button type="button" variant="outline" onClick={() => setDialog({})}>
          Nuevo usuario
        </Button>
      </div>
      <UserTable onEdit={(userId) => setDialog({ userId })} />
      {dialog && (
        <UserFormDialog
          userId={dialog.userId}
          isSelf={dialog.userId !== undefined && dialog.userId === user?.id}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}
