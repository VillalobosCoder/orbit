import { HttpMethod, injectQuery } from "@/api/config";
import { USERS } from "@/api/uris";
import type {
  CreateUserRequestDto,
  CreateUserResponseDto,
} from "@orbit/shared";
import { useMutation } from "@tanstack/react-query";

export function useCreateUser() {
  return useMutation({
    mutationFn: async (input: CreateUserRequestDto) => {
      const response = await injectQuery<CreateUserResponseDto>([USERS], {
        method: HttpMethod.POST,
        body: JSON.stringify(input),
      });

      if (!response) {
        throw new Error("La API no devolvió la contraseña temporal.");
      }

      return response;
    },
  });
}