import type { ProjectRepository } from "../ports/project-repository.port.js";
import type { ProjectIdRequestDto } from "@orbit/shared";
import type { Actor } from "../../shared/actor.js";
import { requireProjectMember } from "../utils/require-project-member.js";

export type DeleteProjectInput = ProjectIdRequestDto & Actor;

export class DeleteProjectUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(input: DeleteProjectInput): Promise<void> {
    const project = await requireProjectMember(this.projects, input.id, input.actorUserId);

    project.assertOwnedBy(input.actorUserId);

    await this.projects.delete(input);
  }
}
