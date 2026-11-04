import type { ProjectMemberRequestDto } from "@orbit/shared";
import { UserNotFoundError } from "../../../domain/user/user.errors.js";
import type { UserRepository } from "../../user/ports/user-repository.port.js";
import type { ProjectMemberRepository } from "../ports/project-member-repository.port.js";
import type { ProjectRepository } from "../ports/project-repository.port.js";
import type { Actor } from "../../shared/actor.js";
import { requireProjectMember } from "../utils/require-project-member.js";

export type AddProjectMemberInput = ProjectMemberRequestDto & Actor;

export class AddProjectMemberUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly members: ProjectMemberRepository,
    private readonly users: UserRepository,
  ) {}

  async execute(input: AddProjectMemberInput): Promise<void> {
    const project = await requireProjectMember(this.projects, input.id, input.actorUserId);

    project.assertOwnedBy(input.actorUserId);

    if (!(await this.users.findById(input.userId))) {
      throw new UserNotFoundError(input.userId);
    }

    await this.members.add(input);
  }
}
