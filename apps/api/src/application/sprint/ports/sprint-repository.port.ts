import type { ProjectIdRequestDto, SprintRequestDto } from "@orbit/shared";
import type { Sprint } from "../../../domain/sprint/sprint.entity.js";
import type { ActorUserId } from "../../shared/actor.js";

export interface SprintRepository {
  save(sprint: Sprint, actorUserId: ActorUserId): Promise<number>;
  findAllByProject(query: ProjectIdRequestDto): Promise<Sprint[]>;
  findById(query: SprintRequestDto): Promise<Sprint | null>;
  findActive(query: ProjectIdRequestDto): Promise<Sprint | null>;
  update(sprint: Sprint, actorUserId: ActorUserId): Promise<void>;
  delete(query: SprintRequestDto): Promise<void>;
}
