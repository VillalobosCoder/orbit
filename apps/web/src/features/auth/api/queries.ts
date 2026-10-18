import {
  login as loginRequest,
  logout as logoutRequest,
} from "@/features/auth/api/auth.api";
import { useAuth } from "@/context/use-auth";
import type { LoginRequestDto } from "@orbit/shared";
import { useMutation } from "@tanstack/react-query";

export function useLogin() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: (data: LoginRequestDto) => loginRequest(data),
    onSuccess: ({ user }) => login(user),
  });
}

export function useLogout() {
  const { logout } = useAuth();

  return useMutation({
    mutationFn: logoutRequest,
    onSuccess: logout,
  });
}
