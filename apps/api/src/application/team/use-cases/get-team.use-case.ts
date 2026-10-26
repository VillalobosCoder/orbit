import type { TeamDto, TeamIdRequestDto } from "@orbit/shared";
import { TeamNotFoundError } from "../../../domain/team/team.errors.js";
import { toTeamDto } from "../mappers/team.mapper.js";
import type { TeamRepository } from "../ports/team-repository.port.js";

export type GetTeamInput = TeamIdRequestDto & { ownerUserId: number };

export class GetTeamUseCase {
  constructor(private readonly teamRepository: TeamRepository) {}

  async execute(input: GetTeamInput): Promise<TeamDto> {
    const team = await this.teamRepository.findById(
      input.id,
      input.ownerUserId,
    );

    if (!team) {
      throw new TeamNotFoundError(input.id);
    }

    return toTeamDto(team);
  }
}
