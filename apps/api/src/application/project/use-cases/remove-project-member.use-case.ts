import type { ProjectMemberRequestDto } from "@orbit/shared";
import { CannotRemoveProjectOwnerError } from "../../../domain/project/project.errors.js";
import { findProjectForMember } from "../find-project-for-member.js";
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
    const project = await findProjectForMember(this.projects, input);
    project.assertOwnedBy(input.actorUserId);

    if (input.userId === project.ownerUserId) {
      throw new CannotRemoveProjectOwnerError();
    }

    await this.members.remove(input);
  }
}
