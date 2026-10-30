import type { SaveSprintRequestDto, SprintRequestDto } from "@orbit/shared";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";
import { SprintNotFoundError } from "../../../domain/sprint/sprint.errors.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { SprintRepository } from "../ports/sprint-repository.port.js";
import type { Actor } from "../../shared/actor.js";

export type UpdateSprintInput = SaveSprintRequestDto &
  SprintRequestDto & Actor;

export class UpdateSprintUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly sprints: SprintRepository,
  ) {}

  async execute(input: UpdateSprintInput): Promise<void> {
    const project = await this.projects.findByIdForMember({
      id: input.id,
      userId: input.actorUserId,
    });

    if (!project) {
      throw new ProjectNotFoundError(input.id);
    }

    const sprint = await this.sprints.findById(input);

    if (!sprint) {
      throw new SprintNotFoundError(input.sprintId);
    }

    await this.sprints.update(sprint.withDetails(input), input.actorUserId);
  }
}
