import { handleMutationError, HttpMethod, injectQuery } from "@/api/config";
import { queryClient } from "@/api/tanstack-query-config";
import { COLUMNS, ORDER, PROJECTS } from "@/api/uris";
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
      injectQuery<BoardColumnDto>([PROJECTS, `/${id}`, COLUMNS], {
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
      injectQuery([PROJECTS, `/${id}`, COLUMNS, `/${columnId}`], {
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
      injectQuery([PROJECTS, `/${id}`, COLUMNS, ORDER], {
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
      injectQuery([PROJECTS, `/${id}`, COLUMNS, `/${columnId}`], {
        method: HttpMethod.DELETE,
        body: JSON.stringify(payload),
      }),
    onSuccess: (_data, { id }) => invalidateProject(id),
    onError: handleMutationError,
  });
}

export type ColumnChangePlan = {
  projectId: number;
  deletions: { columnId: number; moveIssuesToColumnId: number }[];
  updates: (SaveBoardColumnRequestDto & { columnId: number })[];
  creations: { key: string; payload: CreateBoardColumnRequestDto }[];
  /** Ids de las columnas existentes y claves de las nuevas, en el orden final. */
  finalOrder: (number | string)[];
  reorder: boolean;
};

export function useApplyBoardColumnChanges() {
  return useMutation<void, Error, ColumnChangePlan>({
    mutationFn: async (plan) => {
      const columnsUri = [PROJECTS, `/${plan.projectId}`, COLUMNS];

      for (const { columnId, moveIssuesToColumnId } of plan.deletions) {
        const payload: DeleteBoardColumnRequestDto = { moveIssuesToColumnId };
        await injectQuery([...columnsUri, `/${columnId}`], {
          method: HttpMethod.DELETE,
          body: JSON.stringify(payload),
        });
      }

      for (const { columnId, ...payload } of plan.updates) {
        await injectQuery([...columnsUri, `/${columnId}`], {
          method: HttpMethod.PATCH,
          body: JSON.stringify(payload),
        });
      }

      const createdIds = new Map<string, number>();

      for (const { key, payload } of plan.creations) {
        const created = await injectQuery<BoardColumnDto>(columnsUri, {
          method: HttpMethod.POST,
          body: JSON.stringify(payload),
        });

        if (!created) {
          throw new Error("La API no devolvió la columna creada.");
        }

        createdIds.set(key, created.id);
      }

      if (plan.reorder) {
        const payload: ReorderBoardColumnsRequestDto = {
          columnIds: plan.finalOrder.map((entry) =>
            typeof entry === "number" ? entry : createdIds.get(entry)!,
          ),
        };
        await injectQuery([...columnsUri, ORDER], {
          method: HttpMethod.PUT,
          body: JSON.stringify(payload),
        });
      }
    },
    onSettled: (_data, _error, plan) => invalidateProject(plan.projectId),
  });
}
