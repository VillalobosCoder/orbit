export type LoginRequestDto ={
  email: string;
  password: string;
}

export type AuthenticatedUserDto = {
  id: number;
  name: string;
  email: string;
}

export type LoginResponseDto = {
  user: AuthenticatedUserDto;
}

export type ApiErrorResponseDto = {
  error: string;
}
