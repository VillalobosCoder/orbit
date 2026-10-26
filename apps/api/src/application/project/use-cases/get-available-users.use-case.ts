import type { ProjectMemberDto } from "@orbit/shared";
import { findProjectForMember } from "../find-project-for-member.js";
import type { ProjectMemberRepository } from "../ports/project-member-repository.port.js";
import type { ProjectRepository } from "../ports/project-repository.port.js";
import type { ProjectActorInput } from "../project.types.js";

export type GetAvailableUsersInput = ProjectActorInput;

export class GetAvailableUsersUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly members: ProjectMemberRepository,
  ) {}

  async execute(input: GetAvailableUsersInput): Promise<ProjectMemberDto[]> {
    const project = await findProjectForMember(this.projects, input);
    project.assertOwnedBy(input.actorUserId);

    return this.members.findCandidates({ id: input.id });
  }
}
