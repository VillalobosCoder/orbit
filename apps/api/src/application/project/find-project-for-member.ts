import type { Project } from "../../domain/project/project.entity.js";
import { ProjectNotFoundError } from "../../domain/project/project.errors.js";
import type { ProjectRepository } from "./ports/project-repository.port.js";
import type { ProjectActorInput } from "./project.types.js";

export async function findProjectForMember(
  projects: ProjectRepository,
  { id, actorUserId }: ProjectActorInput,
): Promise<Project> {
  const project = await projects.findByIdForMember({ id, userId: actorUserId });

  if (!project) {
    throw new ProjectNotFoundError(id);
  }

  return project;
}
