import type {
  ProjectIdRequestDto,
  ProjectMemberDto,
  ProjectMemberRequestDto,
} from "@orbit/shared";

export type AddProjectMemberCommand = ProjectMemberRequestDto & {
  actorUserId: number;
};

export interface ProjectMemberRepository {
  add(command: AddProjectMemberCommand): Promise<void>;
  remove(command: ProjectMemberRequestDto): Promise<void>;
  findMembers(query: ProjectIdRequestDto): Promise<ProjectMemberDto[]>;
  findCandidates(query: ProjectIdRequestDto): Promise<ProjectMemberDto[]>;
}
