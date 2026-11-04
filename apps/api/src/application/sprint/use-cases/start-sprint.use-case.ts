import type { SprintRequestDto } from "@orbit/shared";
import {
  ActiveSprintAlreadyExistsError,
  SprintNotFoundError,
} from "../../../domain/sprint/sprint.errors.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { SprintRepository } from "../ports/sprint-repository.port.js";
import type { Actor } from "../../shared/actor.js";
import { requireProjectMember } from "../../project/utils/require-project-member.js";

export type StartSprintInput = SprintRequestDto & Actor;

export class StartSprintUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly sprints: SprintRepository,
  ) {}

  async execute(input: StartSprintInput): Promise<void> {
    await requireProjectMember(this.projects, input.id, input.actorUserId);

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
