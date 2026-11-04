import type {
  ProjectIdRequestDto,
  SaveSprintRequestDto,
  SprintDto,
} from "@orbit/shared";
import { Sprint } from "../../../domain/sprint/sprint.entity.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import { toSprintDto } from "../mappers/sprint.mapper.js";
import type { SprintRepository } from "../ports/sprint-repository.port.js";
import type { Actor } from "../../shared/actor.js";
import { requireProjectMember } from "../../project/utils/require-project-member.js";

export type CreateSprintInput = SaveSprintRequestDto &
  ProjectIdRequestDto & Actor;

export class CreateSprintUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly sprints: SprintRepository,
  ) {}

  async execute(input: CreateSprintInput): Promise<SprintDto> {
    await requireProjectMember(this.projects, input.id, input.actorUserId);

    const sprint = Sprint.register({ ...input, projectId: input.id });
    const sprintId = await this.sprints.save(sprint, input.actorUserId);

    return toSprintDto(
      Sprint.fromPersistence({ ...sprint.toPrimitives(), id: sprintId }),
    );
  }
}
