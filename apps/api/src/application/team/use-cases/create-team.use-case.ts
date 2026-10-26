import type { SaveTeamRequestDto, TeamDto } from "@orbit/shared";
import { Team } from "../../../domain/team/team.entity.js";
import { toTeamDto } from "../mappers/team.mapper.js";
import { TeamRepository } from "../ports/team-repository.port.js";

export type CreateTeamInput = SaveTeamRequestDto & { ownerUserId: number };

export class CreateTeamUseCase {
  constructor(private readonly teamRepository: TeamRepository) {}

  async execute(input: CreateTeamInput): Promise<TeamDto> {
    const team = Team.register(input);
    const id = await this.teamRepository.save(team, input.ownerUserId);

    return toTeamDto(Team.fromPersistence({ ...team.toPrimitives(), id }));
  }
}
