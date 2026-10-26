import type { ProjectMemberDto } from "@orbit/shared";
import { findProjectForMember } from "../find-project-for-member.js";
import type { ProjectMemberRepository } from "../ports/project-member-repository.port.js";
import type { ProjectRepository } from "../ports/project-repository.port.js";
import type { ProjectActorInput } from "../project.types.js";

export type GetProjectMembersInput = ProjectActorInput;

export class GetProjectMembersUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly members: ProjectMemberRepository,
  ) {}

  async execute(input: GetProjectMembersInput): Promise<ProjectMemberDto[]> {
    await findProjectForMember(this.projects, input);

    return this.members.findMembers({ id: input.id });
  }
}
