export type CreateUserRequestDto = {
  name: string;
  lastName: string;
  email: string;
};

export type CreateUserResponseDto = {
  temporaryPassword: string;
};
