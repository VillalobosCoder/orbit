import type { TeamIdRequestDto } from "@orbit/shared";
import type { TeamRepository } from "../ports/team-repository.port.js";

export type DeleteTeamInput = TeamIdRequestDto & { ownerUserId: number };

export class DeleteTeamUseCase {
  constructor(private readonly teamRepository: TeamRepository) {}

  async execute(input: DeleteTeamInput): Promise<void> {
    await this.teamRepository.delete(
      input.id,
      input.ownerUserId,
      input.ownerUserId,
    );
  }
}
