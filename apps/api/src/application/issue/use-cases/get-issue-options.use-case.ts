import type { IssueOptionsDto, ProjectIdRequestDto } from "@orbit/shared";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { IssueCatalogRepository } from "../ports/issue-catalog-repository.port.js";
import type { Actor } from "../../shared/actor.js";
import { requireProjectMember } from "../../project/utils/require-project-member.js";

export type GetIssueOptionsInput = ProjectIdRequestDto & Actor;

export class GetIssueOptionsUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly catalog: IssueCatalogRepository,
  ) {}

  async execute(input: GetIssueOptionsInput): Promise<IssueOptionsDto> {
    await requireProjectMember(this.projects, input.id, input.actorUserId);

    const [issueTypes, priorities, difficulties] = await Promise.all([
      this.catalog.findIssueTypes({ id: input.id }),
      this.catalog.findPriorities({ id: input.id }),
      this.catalog.findDifficulties(),
    ]);

    return { issueTypes, priorities, difficulties };
  }
}
