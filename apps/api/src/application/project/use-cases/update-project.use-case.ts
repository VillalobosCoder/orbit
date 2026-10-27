import type { UpdateProjectRequestDto, ProjectIdRequestDto } from "@orbit/shared";
import type { ProjectRepository } from "../ports/project-repository.port.js";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";

export type UpdateProjectInput = UpdateProjectRequestDto &
  ProjectIdRequestDto & { actorUserId: number };

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
