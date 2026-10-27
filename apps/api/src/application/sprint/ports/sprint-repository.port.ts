import type { ProjectIdRequestDto, SprintRequestDto } from "@orbit/shared";
import type { Sprint } from "../../../domain/sprint/sprint.entity.js";

export interface SprintRepository {
  save(sprint: Sprint, actorUserId: number): Promise<number>;
  findAllByProject(query: ProjectIdRequestDto): Promise<Sprint[]>;
  findById(query: SprintRequestDto): Promise<Sprint | null>;
  findActive(query: ProjectIdRequestDto): Promise<Sprint | null>;
  update(sprint: Sprint, actorUserId: number): Promise<void>;
  delete(query: SprintRequestDto): Promise<void>;
}
