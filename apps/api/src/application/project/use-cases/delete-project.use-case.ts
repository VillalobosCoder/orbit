import type { ProjectRepository } from "../ports/project-repository.port.js";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";
import type { ProjectIdRequestDto } from "@orbit/shared";

export type DeleteProjectInput = ProjectIdRequestDto & { actorUserId: number };

export class DeleteProjectUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(input: DeleteProjectInput): Promise<void> {
    const project = await this.projects.findByIdForMember({
      id: input.id,
      userId: input.actorUserId,
    });

    if (!project) {
      throw new ProjectNotFoundError(input.id);
    }

    project.assertOwnedBy(input.actorUserId);

    await this.projects.delete(input);
  }
}
