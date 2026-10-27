import { handleMutationError, HttpMethod, injectQuery } from "@/api/config";
import { queryClient } from "@/api/tanstack-query-config";
import { PROJECTS } from "@/api/uris";
import type {
  BoardColumnDto,
  BoardColumnRequestDto,
  CreateBoardColumnRequestDto,
  DeleteBoardColumnRequestDto,
  ProjectIdRequestDto,
  ReorderBoardColumnsRequestDto,
  SaveBoardColumnRequestDto,
} from "@orbit/shared";
import { useMutation } from "@tanstack/react-query";

function invalidateProject(projectId: number) {
  return queryClient.invalidateQueries({ queryKey: [PROJECTS, projectId] });
}

export function useCreateBoardColumn() {
  return useMutation<
    BoardColumnDto | null,
    Error,
    CreateBoardColumnRequestDto & ProjectIdRequestDto
  >({
    mutationFn: ({ id, ...payload }) =>
      injectQuery<BoardColumnDto>([PROJECTS, `/${id}`, "/columns"], {
        method: HttpMethod.POST,
        body: JSON.stringify(payload),
      }),
    onSuccess: (_column, { id }) => invalidateProject(id),
    onError: handleMutationError,
  });
}

export function useUpdateBoardColumn() {
  return useMutation<
    unknown,
    Error,
    SaveBoardColumnRequestDto & BoardColumnRequestDto
  >({
    mutationFn: ({ id, columnId, ...payload }) =>
      injectQuery([PROJECTS, `/${id}`, "/columns", `/${columnId}`], {
        method: HttpMethod.PATCH,
        body: JSON.stringify(payload),
      }),
    onSuccess: (_data, { id }) => invalidateProject(id),
    onError: handleMutationError,
  });
}

export function useReorderBoardColumns() {
  return useMutation<
    unknown,
    Error,
    ReorderBoardColumnsRequestDto & ProjectIdRequestDto
  >({
    mutationFn: ({ id, ...payload }) =>
      injectQuery([PROJECTS, `/${id}`, "/columns", "/order"], {
        method: HttpMethod.PUT,
        body: JSON.stringify(payload),
      }),
    onSuccess: (_data, { id }) => invalidateProject(id),
    onError: handleMutationError,
  });
}

export function useDeleteBoardColumn() {
  return useMutation<
    unknown,
    Error,
    DeleteBoardColumnRequestDto & BoardColumnRequestDto
  >({
    mutationFn: ({ id, columnId, ...payload }) =>
      injectQuery([PROJECTS, `/${id}`, "/columns", `/${columnId}`], {
        method: HttpMethod.DELETE,
        body: JSON.stringify(payload),
      }),
    onSuccess: (_data, { id }) => invalidateProject(id),
    onError: handleMutationError,
  });
}
