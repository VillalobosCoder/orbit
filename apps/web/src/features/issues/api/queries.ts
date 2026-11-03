import {
  handleMutationError,
  HttpMethod,
  injectQuery,
  requireData,
} from "@/api/config";
import {
  DEBOUNCE_MS,
  POLL_INTERVAL_MS,
  queryClient,
} from "@/api/tanstack-query-config";
import { BOARD, ISSUES, ISSUE_OPTIONS, MOVE, PROJECTS } from "@/api/uris";
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
import { useEffect, useRef } from "react";
import { t } from "@/i18n/locale-store";

export const boardKey = (projectId: number) => [PROJECTS, projectId, "board"] as const;

function invalidateBoard(projectId: number) {
  return queryClient.invalidateQueries({ queryKey: boardKey(projectId) });
}

function fetchBoard(projectId: number) {
  return requireData(
    injectQuery<BoardDto>([PROJECTS, `/${projectId}`, BOARD], {
      method: HttpMethod.GET,
    }),
    t("api.emptyBoard"),
  );
}

export function useGetBoard(projectId: number) {
  return useQuery({
    queryKey: boardKey(projectId),
    queryFn: () => fetchBoard(projectId),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: POLL_INTERVAL_MS,
  });
}

export function useGetIssueOptions(projectId: number) {
  return useQuery({
    queryKey: [PROJECTS, projectId, "issue-options"],
    queryFn: () =>
      requireData(
        injectQuery<IssueOptionsDto>(
          [PROJECTS, `/${projectId}`, ISSUE_OPTIONS],
          { method: HttpMethod.GET },
        ),
        t("api.emptyIssueOptions"),
      ),
  });
}

export function useCreateIssue() {
  return useMutation<
    IssueDto | null,
    Error,
    SaveIssueRequestDto & ProjectIdRequestDto
  >({
    meta: { successMessage: "toasts.issueCreated" },
    mutationFn: ({ id, ...payload }) =>
      injectQuery<IssueDto>([PROJECTS, `/${id}`, ISSUES], {
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
    meta: { successMessage: "toasts.issueUpdated" },
    mutationFn: ({ id, issueId, ...payload }) =>
      injectQuery([PROJECTS, `/${id}`, ISSUES, `/${issueId}`], {
        method: HttpMethod.PATCH,
        body: JSON.stringify(payload),
      }),
    onSuccess: (_data, { id }) => invalidateBoard(id),
    onError: handleMutationError,
  });
}

export function useDeleteIssue() {
  return useMutation<unknown, Error, IssueRequestDto>({
    meta: { successMessage: "toasts.issueDeleted" },
    mutationFn: ({ id, issueId }) =>
      injectQuery([PROJECTS, `/${id}`, ISSUES, `/${issueId}`], {
        method: HttpMethod.DELETE,
      }),
    onSuccess: (_data, { id }) => invalidateBoard(id),
    onError: handleMutationError,
  });
}

type MoveIssueVariables = MoveIssueRequestDto &
  IssueRequestDto & {
    /** Tablero previo a una ráfaga de movimientos locales; es donde se vuelve si el servidor rechaza. */
    rollbackTo?: BoardDto;
  };

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
    mutationFn: ({ id, issueId, columnId, previousIssueId, nextIssueId }) =>
      injectQuery([PROJECTS, `/${id}`, ISSUES, `/${issueId}`, MOVE], {
        method: HttpMethod.PATCH,
        body: JSON.stringify({ columnId, previousIssueId, nextIssueId }),
      }),
    onMutate: async (move) => {
      await queryClient.cancelQueries({ queryKey: boardKey(move.id) });
      const previous =
        move.rollbackTo ??
        queryClient.getQueryData<BoardDto>(boardKey(move.id));

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

/**
 * Para movimientos repetidos (teclado): el tablero cambia al instante, pero al
 * servidor solo llega la última posición cuando el usuario deja de moverla.
 */
export function useDebouncedMoveIssue() {
  const moveIssue = useMoveIssue();
  const pending = useRef<{
    snapshot: BoardDto;
    move: MoveIssueVariables;
  } | null>(null);
  const timer = useRef<number | null>(null);

  function flush() {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }

    const request = pending.current;

    if (!request) return;

    pending.current = null;
    moveIssue.mutate({ ...request.move, rollbackTo: request.snapshot });
  }

  function schedule(move: MoveIssueVariables) {
    const current = queryClient.getQueryData<BoardDto>(boardKey(move.id));

    if (!current) return;

    void queryClient.cancelQueries({ queryKey: boardKey(move.id) });
    queryClient.setQueryData<BoardDto>(
      boardKey(move.id),
      applyMove(current, move),
    );

    pending.current = {
      snapshot: pending.current?.snapshot ?? current,
      move,
    };

    if (timer.current !== null) window.clearTimeout(timer.current);

    timer.current = window.setTimeout(flush, DEBOUNCE_MS);
  }

  const latestFlush = useRef(flush);

  useEffect(() => {
    latestFlush.current = flush;
  });

  useEffect(() => () => latestFlush.current(), []);

  return { schedule, flush };
}
