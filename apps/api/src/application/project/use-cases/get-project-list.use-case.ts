import type { ProjectDto } from "@orbit/shared";
import { toProjectDto } from "../mappers/project.mapper.js";
import type { ProjectRepository } from "../ports/project-repository.port.js";
import type { Actor } from "../../shared/actor.js";

export type GetProjectListInput = Actor;

export class GetProjectListUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute({ actorUserId }: GetProjectListInput): Promise<ProjectDto[]> {
    const projects = await this.projects.findAllByMember(actorUserId);

    return projects.map(toProjectDto);
  }
}
