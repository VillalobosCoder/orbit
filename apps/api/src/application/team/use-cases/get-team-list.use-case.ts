import type { TeamDto } from "@orbit/shared";
import { toTeamDto } from "../mappers/team.mapper.js";
import type { TeamRepository } from "../ports/team-repository.port.js";

export type GetTeamListInput = { ownerUserId: number };

export class GetTeamListUseCase {
  constructor(private readonly teamRepository: TeamRepository) {}

  async execute({ ownerUserId }: GetTeamListInput): Promise<TeamDto[]> {
    const teams = await this.teamRepository.findAllByOwner(ownerUserId);

    return teams.map(toTeamDto);
  }
}
