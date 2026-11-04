import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";
import type { ProjectRepository } from "../ports/project-repository.port.js";

export async function requireProjectMember(
  projects: ProjectRepository,
  projectId: number,
  userId: number,
) {
  const project = await projects.findByIdForMember({ id: projectId, userId });

  if (!project) {
    throw new ProjectNotFoundError(projectId);
  }

  return project;
}
