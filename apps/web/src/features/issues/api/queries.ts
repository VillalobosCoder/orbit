import {
  handleMutationError,
  HttpMethod,
  injectQuery,
  requireData,
} from "@/api/config";
import { queryClient } from "@/api/tanstack-query-config";
import { PROJECTS } from "@/api/uris";
import {
  computeBoardPosition,
  type BoardDto,
  type IssueDto,
  type IssueOptionsDto,
  type IssueRequestDto,
  type MoveIssueRequestDto,
  type ProjectIdRequestDto,
  type SaveIssueRequestDto,
} from "@orbit/shared";
import { useMutation, useQuery } from "@tanstack/react-query";

/** Cada cuánto se vuelve a pedir el tablero mientras está abierto. */
const BOARD_POLL_INTERVAL_MS = 15_000;

const boardKey = (projectId: number) => [PROJECTS, projectId, "board"] as const;

function invalidateBoard(projectId: number) {
  return queryClient.invalidateQueries({ queryKey: boardKey(projectId) });
}

export function useGetBoard(projectId: number) {
  return useQuery({
    queryKey: boardKey(projectId),
    queryFn: () =>
      requireData(
        injectQuery<BoardDto>([PROJECTS, `/${projectId}`, "/board"], {
          method: HttpMethod.GET,
        }),
        "La API no devolvió el tablero.",
      ),
    // Los demás miembros también mueven tarjetas: se revalida con frecuencia.
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: BOARD_POLL_INTERVAL_MS,
  });
}

export function useGetIssueOptions(projectId: number) {
  return useQuery({
    queryKey: [PROJECTS, projectId, "issue-options"],
    queryFn: () =>
      requireData(
        injectQuery<IssueOptionsDto>(
          [PROJECTS, `/${projectId}`, "/issue-options"],
          { method: HttpMethod.GET },
        ),
        "La API no devolvió las opciones de issue.",
      ),
  });
}

export function useCreateIssue() {
  return useMutation<
    IssueDto | null,
    Error,
    SaveIssueRequestDto & ProjectIdRequestDto
  >({
    mutationFn: ({ id, ...payload }) =>
      injectQuery<IssueDto>([PROJECTS, `/${id}`, "/issues"], {
        method: HttpMethod.POST,
        body: JSON.stringify(payload),
      }),
    onSuccess: (_issue, { id }) => invalidateBoard(id),
    onError: handleMutationError,
  });
}

export function useUpdateIssue() {
  return useMutation<
    unknown,
    Error,
    SaveIssueRequestDto & IssueRequestDto
  >({
    mutationFn: ({ id, issueId, ...payload }) =>
      injectQuery([PROJECTS, `/${id}`, "/issues", `/${issueId}`], {
        method: HttpMethod.PATCH,
        body: JSON.stringify(payload),
      }),
    onSuccess: (_data, { id }) => invalidateBoard(id),
    onError: handleMutationError,
  });
}

export function useDeleteIssue() {
  return useMutation<unknown, Error, IssueRequestDto>({
    mutationFn: ({ id, issueId }) =>
      injectQuery([PROJECTS, `/${id}`, "/issues", `/${issueId}`], {
        method: HttpMethod.DELETE,
      }),
    onSuccess: (_data, { id }) => invalidateBoard(id),
    onError: handleMutationError,
  });
}

type MoveIssueVariables = MoveIssueRequestDto & IssueRequestDto;

function applyMove(board: BoardDto, move: MoveIssueVariables): BoardDto {
  const positionOf = (issueId: number | null | undefined) =>
    board.issues.find((issue) => issue.id === issueId)?.boardPosition ?? null;
  const boardPosition = computeBoardPosition(
    positionOf(move.previousIssueId),
    positionOf(move.nextIssueId),
  );

  return {
    ...board,
    issues: board.issues.map((issue) =>
      issue.id === move.issueId
        ? { ...issue, columnId: move.columnId, boardPosition }
        : issue,
    ),
  };
}

export function useMoveIssue() {
  return useMutation<
    unknown,
    Error,
    MoveIssueVariables,
    { previous?: BoardDto }
  >({
    mutationFn: ({ id, issueId, ...payload }) =>
      injectQuery([PROJECTS, `/${id}`, "/issues", `/${issueId}`, "/move"], {
        method: HttpMethod.PATCH,
        body: JSON.stringify(payload),
      }),
    onMutate: async (move) => {
      await queryClient.cancelQueries({ queryKey: boardKey(move.id) });
      const previous = queryClient.getQueryData<BoardDto>(boardKey(move.id));

      if (previous) {
        queryClient.setQueryData<BoardDto>(
          boardKey(move.id),
          applyMove(previous, move),
        );
      }

      return { previous };
    },
    onError: (error, move, context) => {
      if (context?.previous) {
        queryClient.setQueryData(boardKey(move.id), context.previous);
      }
      handleMutationError(error);
    },
    onSettled: (_data, _error, { id }) => invalidateBoard(id),
  });
}
