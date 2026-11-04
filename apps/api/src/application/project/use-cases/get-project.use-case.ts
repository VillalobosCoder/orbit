import type { ProjectDto, ProjectIdRequestDto } from "@orbit/shared";
import { toProjectDto } from "../mappers/project.mapper.js";
import type { ProjectRepository } from "../ports/project-repository.port.js";
import type { Actor } from "../../shared/actor.js";
import { requireProjectMember } from "../utils/require-project-member.js";

export type GetProjectInput = ProjectIdRequestDto & Actor;

export class GetProjectUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(input: GetProjectInput): Promise<ProjectDto> {
    const project = await requireProjectMember(this.projects, input.id, input.actorUserId);

    return toProjectDto(project);
  }
}
