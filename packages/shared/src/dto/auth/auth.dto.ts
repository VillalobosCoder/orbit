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
  email: string;
  permissions: UserPermissionDto[];
  mustChangePassword: boolean;
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
