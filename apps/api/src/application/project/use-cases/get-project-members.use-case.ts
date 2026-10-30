import type { ProjectMemberDto, ProjectIdRequestDto } from "@orbit/shared";
import type { ProjectMemberRepository } from "../ports/project-member-repository.port.js";
import type { ProjectRepository } from "../ports/project-repository.port.js";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";
import type { Actor } from "../../shared/actor.js";

export type GetProjectMembersInput = ProjectIdRequestDto & Actor;

export class GetProjectMembersUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly members: ProjectMemberRepository,
  ) {}

  async execute(input: GetProjectMembersInput): Promise<ProjectMemberDto[]> {
    const isMember = await this.projects.findByIdForMember({
      id: input.id,
      userId: input.actorUserId,
    });

    if (!isMember) {
      throw new ProjectNotFoundError(input.id);
    }

    return this.members.findMembers({ id: input.id });
  }
}
