export type LoginRequestDto ={
  email: string;
  password: string;
}

export type UserPermissionDto = {
  module: string;
  canRead: boolean;
  canWrite: boolean;
}

export type AuthenticatedUserDto = {
  id: number;
  name: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  permissions: UserPermissionDto[];
  mustChangePassword: boolean;
};

export type UpdateProfileRequestDto = {
  name: string;
  lastName: string;
};

export type ChangePasswordRequestDto = {
  currentPassword: string;
  newPassword: string;
};

export type LoginResponseDto = {
  user: AuthenticatedUserDto;
}

export type ApiErrorResponseDto = {
  error: string;
}
