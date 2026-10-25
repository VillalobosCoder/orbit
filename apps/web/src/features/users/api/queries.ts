import { handleMutationError, HttpMethod, injectQuery } from "@/api/config";
import { queryClient } from "@/api/tanstack-query-config";
import { USERS } from "@/api/uris";
import {
  type SaveUserRequestDto,
  type CreateUserResponseDto,
  type UserDetailDto,
  type UserDto,
} from "@orbit/shared";
import { authSessionQueryKey } from "@/features/auth/api/auth.api";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useGetUsers() {
  return useQuery({
    queryKey: [USERS],
    queryFn: () =>
      injectQuery([USERS], { method: HttpMethod.GET }) as Promise<UserDto[]>,
  });
}

export function useGetUser(id: number | null) {
  return useQuery({
    queryKey: [USERS, id],
    enabled: id !== null,
    queryFn: async () => {
      const user = await injectQuery<UserDetailDto>([USERS, `/${id}`], {
        method: HttpMethod.GET,
      });

      if (!user) {
        throw new Error("La API no devolvió el usuario.");
      }

      return user;
    },
  });
}

export function useUpdateUser() {
  return useMutation<
    unknown,
    Error,
    SaveUserRequestDto & { id: number }
  >({
    mutationFn: ({ id, ...payload }) =>
      injectQuery([USERS, `/${id}`], {
        method: HttpMethod.PATCH,
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS] });
      queryClient.invalidateQueries({ queryKey: authSessionQueryKey });
    },
    onError: handleMutationError,
  });
}

export function useCreateUser() {
  return useMutation<
    CreateUserResponseDto | null,
    Error,
    SaveUserRequestDto
  >({
    mutationFn: (payload) =>
      injectQuery<CreateUserResponseDto>([USERS], {
        method: HttpMethod.POST,
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS] });
    },
    onError: handleMutationError,
  });
}

export function useDeleteUser() {
  return useMutation({
    mutationFn: (id: number) =>
      injectQuery([USERS, `/${id}`], {
        method: HttpMethod.DELETE,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS] });
    },
    onError: handleMutationError,
  });
}
