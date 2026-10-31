import type { PageDto } from "../api/api.dto.js";
import type { UserPermissionDto } from "../auth/auth.dto.js";

export type UserIdRequestDto = {
  id: number;
};

export type SaveUserRequestDto = {
  name: string;
  lastName: string;
  email: string;
  permissions?: UserPermissionDto[];
};

export type CreateUserResponseDto = {
  temporaryPassword: string;
};

export type ResetUserPasswordResponseDto = CreateUserResponseDto;

export type UserDto = {
  id: number;
  name: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
};

export type UserDetailDto = UserDto & {
  permissions: UserPermissionDto[];
};

export const USER_SORT_FIELDS = ["name", "email"] as const;

export type UserSortField = (typeof USER_SORT_FIELDS)[number];

export type SortDirection = "asc" | "desc";

export type UserListQueryDto = {
  search?: string;
  sortBy: UserSortField;
  sortDirection: SortDirection;
  page: number;
  pageSize: number;
};

export type UserListResponseDto = PageDto<UserDto>;
