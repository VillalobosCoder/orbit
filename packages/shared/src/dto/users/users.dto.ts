import type { UserPermissionDto } from "../auth/auth.dto.js";

export type CreateUserRequestDto = {
  name: string;
  lastName: string;
  email: string;
  permissions: UserPermissionDto[];
};

export type CreateUserResponseDto = {
  temporaryPassword: string;
};

export type UserDto = {
  id: number;
  name: string;
  lastName: string;
  email: string;
};