import type { ProjectMemberRequestDto } from "@orbit/shared";
import { CannotRemoveProjectOwnerError, ProjectNotFoundError } from "../../../domain/project/project.errors.js";
import type { ProjectMemberRepository } from "../ports/project-member-repository.port.js";
import type { ProjectRepository } from "../ports/project-repository.port.js";

export type RemoveProjectMemberInput = ProjectMemberRequestDto & {
  actorUserId: number;
};

export class RemoveProjectMemberUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly members: ProjectMemberRepository,
  ) {}

  async execute(input: RemoveProjectMemberInput): Promise<void> {
    const project = await this.projects.findByIdForMember({
      id: input.id,
      userId: input.actorUserId,
    });

    if (!project) {
      throw new ProjectNotFoundError(input.id);
    }

    project.assertOwnedBy(input.actorUserId);

    if (input.userId === project.ownerUserId) {
      throw new CannotRemoveProjectOwnerError();
    }

    await this.members.remove(input);
  }
}
