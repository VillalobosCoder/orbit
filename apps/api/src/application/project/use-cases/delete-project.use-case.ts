import { findProjectForMember } from "../find-project-for-member.js";
import type { ProjectRepository } from "../ports/project-repository.port.js";
import type { ProjectActorInput } from "../project.types.js";

export type DeleteProjectInput = ProjectActorInput;

export class DeleteProjectUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(input: DeleteProjectInput): Promise<void> {
    const project = await findProjectForMember(this.projects, input);
    project.assertOwnedBy(input.actorUserId);

    await this.projects.delete(input);
  }
}
