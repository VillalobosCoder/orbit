import type { ProjectMemberRequestDto } from "@orbit/shared";
import { UserNotFoundError } from "../../../domain/user/user.errors.js";
import type { UserRepository } from "../../user/ports/user-repository.port.js";
import type { ProjectMemberRepository } from "../ports/project-member-repository.port.js";
import type { ProjectRepository } from "../ports/project-repository.port.js";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";
import type { Actor } from "../../shared/actor.js";

export type AddProjectMemberInput = ProjectMemberRequestDto & Actor;

export class AddProjectMemberUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly members: ProjectMemberRepository,
    private readonly users: UserRepository,
  ) {}

  async execute(input: AddProjectMemberInput): Promise<void> {
    const project = await this.projects.findByIdForMember({
      id: input.id,
      userId: input.actorUserId,
    });

    if (!project) {
      throw new ProjectNotFoundError(input.id);
    }

    project.assertOwnedBy(input.actorUserId);

    if (!(await this.users.findById(input.userId))) {
      throw new UserNotFoundError(input.userId);
    }

    await this.members.add(input);
  }
}
