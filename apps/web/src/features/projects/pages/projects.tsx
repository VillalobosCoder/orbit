import { useState } from "react";

import { Button } from "@/components/ui/button";
import { usePermission } from "@/context/auth/use-permission";
import type { ProjectDto } from "@orbit/shared";
import ProjectFormDialog from "./components/project-form-dialog";
import ProjectTable from "./components/project-table";

type DialogState = { project?: ProjectDto } | null;

export default function ProjectsPage() {
  const { canWrite } = usePermission("projects");
  const [dialog, setDialog] = useState<DialogState>(null);

  return (
    <div>
      <h1>Projects Page</h1>
      {canWrite && (
        <div>
          <Button type="button" variant="outline" onClick={() => setDialog({})}>
            Nuevo proyecto
          </Button>
        </div>
      )}
      <ProjectTable onEdit={(project) => setDialog({ project })} />
      {dialog && (
        <ProjectFormDialog
          project={dialog.project}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}
