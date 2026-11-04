import type { UpdateProjectRequestDto, ProjectIdRequestDto } from "@orbit/shared";
import type { ProjectRepository } from "../ports/project-repository.port.js";
import type { Actor } from "../../shared/actor.js";
import { requireProjectMember } from "../utils/require-project-member.js";

export type UpdateProjectInput = UpdateProjectRequestDto &
  ProjectIdRequestDto & Actor;

export class UpdateProjectUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(input: UpdateProjectInput): Promise<void> {
    const project = await requireProjectMember(this.projects, input.id, input.actorUserId);

    await this.projects.update(project.withDetails(input), input.actorUserId);
  }
}
