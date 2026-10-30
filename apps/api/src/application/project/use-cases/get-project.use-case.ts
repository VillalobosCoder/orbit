import type { ProjectDto, ProjectIdRequestDto } from "@orbit/shared";
import { toProjectDto } from "../mappers/project.mapper.js";
import type { ProjectRepository } from "../ports/project-repository.port.js";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";
import type { Actor } from "../../shared/actor.js";

export type GetProjectInput = ProjectIdRequestDto & Actor;

export class GetProjectUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(input: GetProjectInput): Promise<ProjectDto> {
    const project = await this.projects.findByIdForMember({
      id: input.id,
      userId: input.actorUserId,
    });

    if (!project) {
      throw new ProjectNotFoundError(input.id);
    }

    return toProjectDto(project);
  }
}
