import type {
  ProjectIdRequestDto,
  ProjectMemberDto,
  ProjectMemberRequestDto,
} from "@orbit/shared";
import type { Actor } from "../../shared/actor.js";

export type AddProjectMemberCommand = ProjectMemberRequestDto & Actor;

export interface ProjectMemberRepository {
  add(command: AddProjectMemberCommand): Promise<void>;
  remove(command: ProjectMemberRequestDto): Promise<void>;
  findMembers(query: ProjectIdRequestDto): Promise<ProjectMemberDto[]>;
  findCandidates(query: ProjectIdRequestDto): Promise<ProjectMemberDto[]>;
}
