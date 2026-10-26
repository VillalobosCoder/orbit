import type { UserDto } from "../users/users.dto.js";

export type ProjectDto = {
  id: number;
  ownerUserId: number;
  projectKey: string;
  name: string;
  description: string | null;
};

export type ProjectIdRequestDto = {
  id: number;
};

export type UpdateProjectRequestDto = {
  name: string;
  description?: string | null;
};

export type CreateProjectRequestDto = UpdateProjectRequestDto & {
  projectKey: string;
};

export type ProjectMemberDto = UserDto;

export type AddProjectMemberRequestDto = {
  userId: number;
};

export type ProjectMemberRequestDto = ProjectIdRequestDto &
  AddProjectMemberRequestDto;
