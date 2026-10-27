import type { SprintRequestDto } from "@orbit/shared";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";
import {
  ActiveSprintAlreadyExistsError,
  SprintNotFoundError,
} from "../../../domain/sprint/sprint.errors.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { SprintRepository } from "../ports/sprint-repository.port.js";

export type StartSprintInput = SprintRequestDto & { actorUserId: number };

export class StartSprintUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly sprints: SprintRepository,
  ) {}

  async execute(input: StartSprintInput): Promise<void> {
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

    const started = sprint.start();

    if (await this.sprints.findActive({ id: input.id })) {
      throw new ActiveSprintAlreadyExistsError();
    }

    await this.sprints.update(started, input.actorUserId);
  }
}
