import {
  handleMutationError,
  HttpMethod,
  injectQuery,
  requireData,
} from "@/api/config";
import { queryClient } from "@/api/tanstack-query-config";
import { RESET_PASSWORD, USERS } from "@/api/uris";
import {
  type SaveUserRequestDto,
  type CreateUserResponseDto,
  type ResetUserPasswordResponseDto,
  type UserDetailDto,
  type UserListQueryDto,
  type UserListResponseDto,
} from "@orbit/shared";
import { authSessionQueryKey } from "@/features/auth/api/auth.api";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

export function useGetUsers(query: UserListQueryDto) {
  const { search, ...rest } = query;

  return useQuery({
    queryKey: [USERS, "list", query],
    placeholderData: keepPreviousData,
    queryFn: () =>
      requireData(
        injectQuery<UserListResponseDto>(
          [USERS],
          { method: HttpMethod.GET },
          search ? { ...rest, search } : rest,
        ),
        "La API no devolvió los usuarios.",
      ),
  });
}

export function useGetUser(id: number | null) {
  return useQuery({
    queryKey: [USERS, id],
    enabled: id !== null,
    queryFn: () =>
      requireData(
        injectQuery<UserDetailDto>([USERS, `/${id}`], {
          method: HttpMethod.GET,
        }),
        "La API no devolvió el usuario.",
      ),
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

export function useResetUserPassword() {
  return useMutation<ResetUserPasswordResponseDto | null, Error, number>({
    mutationFn: (id) =>
      injectQuery<ResetUserPasswordResponseDto>(
        [USERS, `/${id}`, RESET_PASSWORD],
        { method: HttpMethod.POST },
      ),
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
