import type { ProjectIdRequestDto } from "@orbit/shared";
import type { Project } from "../../../domain/project/project.entity.js";
import type { Actor, ActorUserId } from "../../shared/actor.js";

export type FindProjectForMemberQuery = ProjectIdRequestDto & {
  userId: number;
};

export type DeleteProjectCommand = ProjectIdRequestDto & Actor;

export interface ProjectRepository {
  save(project: Project, actorUserId: ActorUserId): Promise<number>;
  findAllByMember(userId: number): Promise<Project[]>;
  findByIdForMember(query: FindProjectForMemberQuery): Promise<Project | null>;
  update(project: Project, actorUserId: ActorUserId): Promise<void>;
  delete(command: DeleteProjectCommand): Promise<void>;
  nextIssueNumber(query: ProjectIdRequestDto): Promise<number>;
}
