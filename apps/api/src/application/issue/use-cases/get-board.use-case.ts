import type { BoardDto, ProjectIdRequestDto } from "@orbit/shared";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import { toSprintDto } from "../../sprint/mappers/sprint.mapper.js";
import type { SprintRepository } from "../../sprint/ports/sprint-repository.port.js";
import { toIssueDto } from "../mappers/issue.mapper.js";
import type { IssueCatalogRepository } from "../ports/issue-catalog-repository.port.js";
import type { IssueRepository } from "../ports/issue-repository.port.js";
import type { Actor } from "../../shared/actor.js";
import { requireProjectMember } from "../../project/utils/require-project-member.js";

export type GetBoardInput = ProjectIdRequestDto & Actor;

export class GetBoardUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly sprints: SprintRepository,
    private readonly issues: IssueRepository,
    private readonly catalog: IssueCatalogRepository,
  ) {}

  async execute(input: GetBoardInput): Promise<BoardDto> {
    const project = await requireProjectMember(this.projects, input.id, input.actorUserId);

    const activeSprint = await this.sprints.findActive({ id: input.id });
    const [columns, issues] = await Promise.all([
      this.catalog.findColumns({ id: input.id }),
      this.issues.findAllByProject({
        id: input.id,
        sprintId: activeSprint?.id ?? null,
      }),
    ]);

    return {
      columns,
      activeSprint: activeSprint ? toSprintDto(activeSprint) : null,
      issues: issues.map((issue) => toIssueDto(issue, project.projectKey)),
    };
  }
}
