import type { UpdateProjectRequestDto } from "@orbit/shared";
import { findProjectForMember } from "../find-project-for-member.js";
import type { ProjectRepository } from "../ports/project-repository.port.js";
import type { ProjectActorInput } from "../project.types.js";

export type UpdateProjectInput = UpdateProjectRequestDto & ProjectActorInput;

export class UpdateProjectUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(input: UpdateProjectInput): Promise<void> {
    const project = await findProjectForMember(this.projects, input);

    await this.projects.update(project.withDetails(input), input.actorUserId);
  }
}
