import type { BoardDto, ProjectIdRequestDto } from "@orbit/shared";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import { toIssueDto } from "../mappers/issue.mapper.js";
import type { IssueCatalogRepository } from "../ports/issue-catalog-repository.port.js";
import type { IssueRepository } from "../ports/issue-repository.port.js";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";

export type GetBoardInput = ProjectIdRequestDto & { actorUserId: number };

export class GetBoardUseCase {
  constructor(
    private readonly projects: ProjectRepository,
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

    const [columns, issues] = await Promise.all([
      this.catalog.findColumns({ id: input.id }),
      this.issues.findAllByProject({ id: input.id }),
    ]);

    return {
      columns,
      issues: issues.map((issue) => toIssueDto(issue, project.projectKey)),
    };
  }
}
