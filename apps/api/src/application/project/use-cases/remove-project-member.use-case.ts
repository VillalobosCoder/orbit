import type { ProjectMemberRequestDto } from "@orbit/shared";
import { CannotRemoveProjectOwnerError } from "../../../domain/project/project.errors.js";
import type { ProjectMemberRepository } from "../ports/project-member-repository.port.js";
import type { ProjectRepository } from "../ports/project-repository.port.js";
import type { Actor } from "../../shared/actor.js";
import { requireProjectMember } from "../utils/require-project-member.js";

export type RemoveProjectMemberInput = ProjectMemberRequestDto & Actor;

export class RemoveProjectMemberUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly members: ProjectMemberRepository,
  ) {}

  async execute(input: RemoveProjectMemberInput): Promise<void> {
    const project = await requireProjectMember(this.projects, input.id, input.actorUserId);

    project.assertOwnedBy(input.actorUserId);

    if (input.userId === project.ownerUserId) {
      throw new CannotRemoveProjectOwnerError();
    }

    await this.members.remove(input);
  }
}
