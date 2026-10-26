import type { ProjectDto } from "@orbit/shared";
import type { Project } from "../../../domain/project/project.entity.js";

export function toProjectDto(project: Project): ProjectDto {
  return {
    id: project.id!,
    ownerUserId: project.ownerUserId,
    projectKey: project.projectKey,
    name: project.name,
    description: project.description,
  };
}
