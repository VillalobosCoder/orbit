import { handleMutationError, HttpMethod, injectQuery } from "@/api/config";
import { AUTH, LOGIN, LOGOUT } from "@/api/uris";
import { useAuth } from "@/context/auth/use-auth";
import type { LoginRequestDto, LoginResponseDto } from "@orbit/shared";
import { useMutation } from "@tanstack/react-query";

export function useLogin() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: async (data: LoginRequestDto) => {
      const response = await injectQuery<LoginResponseDto>([AUTH, LOGIN], {
        method: HttpMethod.POST,
        body: JSON.stringify(data),
      });

      if (!response) {
        throw new Error("La API no devolvió los datos de la sesión.");
      }

      return response;
    },
    onSuccess: (response) => login(response),
    onError: handleMutationError,
  });
}

export function useLogout() {
  const { logout } = useAuth();

  return useMutation({
    mutationFn: () =>
      injectQuery<null>([AUTH, LOGOUT], { method: HttpMethod.POST }),
    onSuccess: logout,
  });
}
