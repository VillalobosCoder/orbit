import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth/use-auth";
import { usePermission } from "@/context/auth/use-permission";
import { PageHeaderComponent } from "@/components/ui/page-header-component";
import UserFormDialog from "./components/user-form-dialog";
import UserTable from "./components/user-table";

type DialogState = { userId?: number } | null;

export default function UsersPage() {
  const { user } = useAuth();
  const { canWrite } = usePermission("users");
  const [dialog, setDialog] = useState<DialogState>(null);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <PageHeaderComponent
        title="Usuarios"
        description="Gestiona las cuentas y los permisos de acceso de tu equipo."
      >
        {canWrite && (
          <Button type="button" onClick={() => setDialog({})}>
            <Plus />
            Nuevo usuario
          </Button>
        )}
      </PageHeaderComponent>
      <UserTable
        canWrite={canWrite}
        onEdit={(userId) => setDialog({ userId })}
      />
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
