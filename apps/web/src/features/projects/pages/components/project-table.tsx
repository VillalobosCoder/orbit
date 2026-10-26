import { useAuth } from "@/context/auth/use-auth";
import { usePermission } from "@/context/auth/use-permission";
import { TableComponent } from "@/shared/ui/custom-components/table-component";
import type { ProjectDto } from "@orbit/shared";
import { useDeleteProject, useGetProjects } from "../../api/queries";
import { createColumns } from "../utils/projects-table-columns";

export default function ProjectTable({
  onEdit,
}: {
  onEdit: (project: ProjectDto) => void;
}) {
  const { data, isLoading, error } = useGetProjects();
  const { user } = useAuth();
  const { canWrite } = usePermission("projects");
  const deleteProject = useDeleteProject();

  const onDelete = (project: ProjectDto) => {
    if (
      window.confirm(`¿Seguro que quieres eliminar el proyecto ${project.name}?`)
    ) {
      deleteProject.mutate(project.id);
    }
  };

  const columns = createColumns({
    currentUserId: user?.id,
    canWrite,
    deletingProjectId: deleteProject.isPending
      ? deleteProject.variables
      : undefined,
    onEdit,
    onDelete,
  });

  if (isLoading) return <p>Cargando proyectos...</p>;
  if (error) return <p role="alert">{error.message}</p>;

  return <TableComponent data={data ?? []} columns={columns} />;
}
