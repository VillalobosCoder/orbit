import type { ProjectDto } from "@orbit/shared";
import { findProjectForMember } from "../find-project-for-member.js";
import { toProjectDto } from "../mappers/project.mapper.js";
import type { ProjectRepository } from "../ports/project-repository.port.js";
import type { ProjectActorInput } from "../project.types.js";

export type GetProjectInput = ProjectActorInput;

export class GetProjectUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(input: GetProjectInput): Promise<ProjectDto> {
    return toProjectDto(await findProjectForMember(this.projects, input));
  }
}
