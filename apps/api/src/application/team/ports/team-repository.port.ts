import type { Team } from "../../../domain/team/team.entity.js";

export interface TeamRepository {
  save(team: Team, actorUserId: number): Promise<number>;
  findAllByOwner(ownerUserId: number): Promise<Team[]>;
  findById(id: number, ownerUserId: number): Promise<Team | null>;
  update(team: Team, actorUserId: number): Promise<void>;
  delete(id: number, ownerUserId: number, actorUserId: number): Promise<void>;
}
