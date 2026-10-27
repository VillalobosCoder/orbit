import { useState } from "react";
import { useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { useAuth } from "@/context/auth/use-auth";
import { usePermission } from "@/context/auth/use-permission";
import { useGetProject } from "../api/queries";
import ProjectFormDialog from "./components/project-form-dialog";
import ProjectMembers from "./components/project-members";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const projectId = Number(id);
  const { user } = useAuth();
  const { canWrite } = usePermission("projects");
  const { data: project, isLoading, error } = useGetProject(projectId);
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) return <p>Cargando proyecto...</p>;
  if (error || !project) {
    return <p role="alert">{error?.message ?? "Proyecto no encontrado."}</p>;
  }

  return (
    <div>
      <h1>
        {project.projectKey} · {project.name}
      </h1>
      {project.description && <p>{project.description}</p>}
      {canWrite && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsEditing(true)}
        >
          Editar proyecto
        </Button>
      )}
      {isEditing && (
        <ProjectFormDialog
          project={project}
          onClose={() => setIsEditing(false)}
        />
      )}
      <ProjectMembers
        project={project}
        canManage={canWrite && project.ownerUserId === user?.id}
      />
    </div>
  );
}
