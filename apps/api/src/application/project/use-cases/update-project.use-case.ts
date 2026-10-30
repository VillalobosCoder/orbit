import type { UpdateProjectRequestDto, ProjectIdRequestDto } from "@orbit/shared";
import type { ProjectRepository } from "../ports/project-repository.port.js";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";
import type { Actor } from "../../shared/actor.js";

export type UpdateProjectInput = UpdateProjectRequestDto &
  ProjectIdRequestDto & Actor;

export class UpdateProjectUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(input: UpdateProjectInput): Promise<void> {
    const project = await this.projects.findByIdForMember({
      id: input.id,
      userId: input.actorUserId,
    });

    if (!project) {
      throw new ProjectNotFoundError(input.id);
    }

    await this.projects.update(project.withDetails(input), input.actorUserId);
  }
}
