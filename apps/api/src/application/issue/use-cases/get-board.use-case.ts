import type { BoardDto, ProjectIdRequestDto } from "@orbit/shared";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import { toSprintDto } from "../../sprint/mappers/sprint.mapper.js";
import type { SprintRepository } from "../../sprint/ports/sprint-repository.port.js";
import { toIssueDto } from "../mappers/issue.mapper.js";
import type { IssueCatalogRepository } from "../ports/issue-catalog-repository.port.js";
import type { IssueRepository } from "../ports/issue-repository.port.js";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";

export type GetBoardInput = ProjectIdRequestDto & { actorUserId: number };

export class GetBoardUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly sprints: SprintRepository,
    private readonly issues: IssueRepository,
    private readonly catalog: IssueCatalogRepository,
  ) {}

  async execute(input: GetBoardInput): Promise<BoardDto> {
    const project = await this.projects.findByIdForMember({
      id: input.id,
      userId: input.actorUserId,
    });

    if (!project) {
      throw new ProjectNotFoundError(input.id);
    }

    // Con un sprint activo el tablero muestra solo sus issues; si no, el backlog.
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
