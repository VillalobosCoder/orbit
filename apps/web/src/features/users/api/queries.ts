import { handleMutationError, HttpMethod, injectQuery } from "@/api/config";
import { queryClient } from "@/api/tanstack-query-config";
import { USERS } from "@/api/uris";
import {
  type CreateUserRequestDto,
  type CreateUserResponseDto,
  type UserDto,
} from "@orbit/shared";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useGetUsers() {
  return useQuery({
    queryKey: [USERS],
    queryFn: () =>
      injectQuery([USERS], { method: HttpMethod.GET }) as Promise<UserDto[]>,
  });
}

export function useCreateUser() {
  return useMutation({
    mutationFn: (payload: CreateUserRequestDto) =>
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
