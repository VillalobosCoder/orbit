import type { CreateProjectRequestDto, ProjectDto } from "@orbit/shared";
import { Project } from "../../../domain/project/project.entity.js";
import type { TransactionManager } from "../../shared/ports/transaction-manager.port.js";
import { toProjectDto } from "../mappers/project.mapper.js";
import type { IssueCatalogRepository } from "../../issue/ports/issue-catalog-repository.port.js";
import type { ProjectMemberRepository } from "../ports/project-member-repository.port.js";
import type { ProjectRepository } from "../ports/project-repository.port.js";

export type CreateProjectInput = CreateProjectRequestDto & {
  actorUserId: number;
};

export class CreateProjectUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly members: ProjectMemberRepository,
    private readonly catalog: IssueCatalogRepository,
    private readonly transaction: TransactionManager,
  ) {}

  async execute(input: CreateProjectInput): Promise<ProjectDto> {
    const project = Project.register({
      ...input,
      ownerUserId: input.actorUserId,
    });

    return this.transaction.run(async () => {
      const id = await this.projects.save(project, input.actorUserId);
      await this.members.add({
        id,
        userId: input.actorUserId,
        actorUserId: input.actorUserId,
      });
      await this.catalog.seedDefaults({
        id,
        actorUserId: input.actorUserId,
      });

      return toProjectDto(
        Project.fromPersistence({ ...project.toPrimitives(), id }),
      );
    });
  }
}
