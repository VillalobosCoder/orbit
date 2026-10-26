import type { TeamDto } from "@orbit/shared";
import type { Team } from "../../../domain/team/team.entity.js";

export function toTeamDto(team: Team): TeamDto {
  return {
    id: team.id!,
    name: team.name,
    description: team.description,
  };
}
