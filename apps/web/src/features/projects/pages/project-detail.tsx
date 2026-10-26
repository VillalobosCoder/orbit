import { useParams } from "react-router-dom";

import { useAuth } from "@/context/auth/use-auth";
import { usePermission } from "@/context/auth/use-permission";
import { useGetProject } from "../api/queries";
import ProjectMembers from "./components/project-members";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const projectId = Number(id);
  const { user } = useAuth();
  const { canWrite } = usePermission("projects");
  const { data: project, isLoading, error } = useGetProject(projectId);

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
      <ProjectMembers
        project={project}
        canManage={canWrite && project.ownerUserId === user?.id}
      />
    </div>
  );
}
