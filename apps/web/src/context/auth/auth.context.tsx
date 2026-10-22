import { useCallback, useMemo, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { LoginResponseDto } from "@orbit/shared";
import { AuthContext } from "./auth-context";
import { authSessionQueryKey, getCurrentSession } from "@/features/auth/api/auth.api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({
    queryKey: authSessionQueryKey,
    queryFn: getCurrentSession,
  });
  const user = sessionQuery.data?.user ?? null;

  const login = useCallback(
    (response: LoginResponseDto) => {
      queryClient.setQueryData<LoginResponseDto>(authSessionQueryKey, response);
    },
    [queryClient],
  );

  const logout = useCallback(() => {
    queryClient.setQueryData<LoginResponseDto | null>(
      authSessionQueryKey,
      null,
    );
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading: sessionQuery.isLoading,
      sessionError: sessionQuery.error?.message,
      login,
      logout,
    }),
    [user, sessionQuery.isLoading, sessionQuery.error, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
