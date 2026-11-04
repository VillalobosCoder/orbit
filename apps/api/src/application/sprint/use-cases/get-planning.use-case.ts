import type { PlanningDto, ProjectIdRequestDto } from "@orbit/shared";
import { toIssueDto } from "../../issue/mappers/issue.mapper.js";
import type { IssueCatalogRepository } from "../../issue/ports/issue-catalog-repository.port.js";
import type { IssueRepository } from "../../issue/ports/issue-repository.port.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import { toSprintDto } from "../mappers/sprint.mapper.js";
import type { SprintRepository } from "../ports/sprint-repository.port.js";
import type { Actor } from "../../shared/actor.js";
import { requireProjectMember } from "../../project/utils/require-project-member.js";

export type GetPlanningInput = ProjectIdRequestDto & Actor;

export class GetPlanningUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly sprints: SprintRepository,
    private readonly issues: IssueRepository,
    private readonly catalog: IssueCatalogRepository,
  ) {}

  async execute(input: GetPlanningInput): Promise<PlanningDto> {
    const project = await requireProjectMember(this.projects, input.id, input.actorUserId);

    const [sprints, columns, issues] = await Promise.all([
      this.sprints.findAllByProject({ id: input.id }),
      this.catalog.findColumns({ id: input.id }),
      this.issues.findAllByProject({ id: input.id }),
    ]);

    return {
      sprints: sprints.map(toSprintDto),
      columns,
      issues: issues.map((issue) => toIssueDto(issue, project.projectKey)),
    };
  }
}
