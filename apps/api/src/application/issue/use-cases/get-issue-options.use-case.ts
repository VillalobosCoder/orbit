import type { IssueOptionsDto, ProjectIdRequestDto } from "@orbit/shared";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { IssueCatalogRepository } from "../ports/issue-catalog-repository.port.js";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";

export type GetIssueOptionsInput = ProjectIdRequestDto &
  { actorUserId: number };

export class GetIssueOptionsUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly catalog: IssueCatalogRepository,
  ) {}

  async execute(input: GetIssueOptionsInput): Promise<IssueOptionsDto> {
    const isMember = await this.projects.findByIdForMember({
      id: input.id,
      userId: input.actorUserId,
    });

    if (!isMember) {
      throw new ProjectNotFoundError(input.id);
    }

    const [issueTypes, priorities, difficulties] = await Promise.all([
      this.catalog.findIssueTypes({ id: input.id }),
      this.catalog.findPriorities({ id: input.id }),
      this.catalog.findDifficulties(),
    ]);

    return { issueTypes, priorities, difficulties };
  }
}
