export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthenticatedUserDto {
  id: number;
  name: string;
  email: string;
}

export interface LoginResponseDto {
  user: AuthenticatedUserDto;
}

export interface ApiErrorResponseDto {
  error: string;
}
