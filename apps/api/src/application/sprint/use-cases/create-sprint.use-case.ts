import type {
  ProjectIdRequestDto,
  SaveSprintRequestDto,
  SprintDto,
} from "@orbit/shared";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";
import { Sprint } from "../../../domain/sprint/sprint.entity.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import { toSprintDto } from "../mappers/sprint.mapper.js";
import type { SprintRepository } from "../ports/sprint-repository.port.js";
import type { Actor } from "../../shared/actor.js";

export type CreateSprintInput = SaveSprintRequestDto &
  ProjectIdRequestDto & Actor;

export class CreateSprintUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly sprints: SprintRepository,
  ) {}

  async execute(input: CreateSprintInput): Promise<SprintDto> {
    const project = await this.projects.findByIdForMember({
      id: input.id,
      userId: input.actorUserId,
    });

    if (!project) {
      throw new ProjectNotFoundError(input.id);
    }

    const sprint = Sprint.register({ ...input, projectId: input.id });
    const sprintId = await this.sprints.save(sprint, input.actorUserId);

    return toSprintDto(
      Sprint.fromPersistence({ ...sprint.toPrimitives(), id: sprintId }),
    );
  }
}
