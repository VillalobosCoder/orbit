import type { ProjectMemberDto, ProjectIdRequestDto } from "@orbit/shared";
import type { ProjectMemberRepository } from "../ports/project-member-repository.port.js";
import type { ProjectRepository } from "../ports/project-repository.port.js";
import type { Actor } from "../../shared/actor.js";
import { requireProjectMember } from "../utils/require-project-member.js";

export type GetAvailableUsersInput = ProjectIdRequestDto & Actor;

export class GetAvailableUsersUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly members: ProjectMemberRepository,
  ) {}

  async execute(input: GetAvailableUsersInput): Promise<ProjectMemberDto[]> {
    const project = await requireProjectMember(this.projects, input.id, input.actorUserId);

    project.assertOwnedBy(input.actorUserId);

    return this.members.findCandidates({ id: input.id });
  }
}
