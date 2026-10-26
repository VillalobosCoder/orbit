import type { SaveTeamRequestDto } from "@orbit/shared";
import { TeamNotFoundError } from "../../../domain/team/team.errors.js";
import type { TeamRepository } from "../ports/team-repository.port.js";

export type UpdateTeamInput = SaveTeamRequestDto & {
  id: number;
  ownerUserId: number;
};

export class UpdateTeamUseCase {
  constructor(private readonly teamRepository: TeamRepository) {}

  async execute(input: UpdateTeamInput): Promise<void> {
    const team = await this.teamRepository.findById(
      input.id,
      input.ownerUserId,
    );

    if (!team) {
      throw new TeamNotFoundError(input.id);
    }

    await this.teamRepository.update(
      team.withDetails(input),
      input.ownerUserId,
    );
  }
}
