import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth/use-auth";
import { usePermission } from "@/context/auth/use-permission";
import { PageHeaderComponent } from "@/components/ui/page-header-component";
import UserFormDialog from "./components/user-form-dialog";
import UserTable from "./components/user-table";
import { useI18n } from "@/i18n/use-i18n";

type DialogState = { userId?: number } | null;

export default function UsersPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { canWrite } = usePermission("users");
  const [dialog, setDialog] = useState<DialogState>(null);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <PageHeaderComponent
        title={t("users.title")}
        description={t("users.description")}
      >
        {canWrite && (
          <Button type="button" onClick={() => setDialog({})}>
            <Plus />
            {t("users.newUser")}
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
