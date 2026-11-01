import {
  handleMutationError,
  HttpMethod,
  injectQuery,
  requireData,
} from "@/api/config";
import { POLL_INTERVAL_MS, queryClient } from "@/api/tanstack-query-config";
import { CLOSE, ISSUES, PLANNING, PROJECTS, SPRINT, SPRINTS, START } from "@/api/uris";
import type {
  AssignSprintRequestDto,
  IssueRequestDto,
  PlanningDto,
  ProjectIdRequestDto,
  SaveSprintRequestDto,
  SprintDto,
  SprintRequestDto,
} from "@orbit/shared";
import { useMutation, useQuery } from "@tanstack/react-query";

/** Sprint, tablero e issues dependen unos de otros: se refrescan juntos. */
function invalidateProject(projectId: number) {
  return queryClient.invalidateQueries({ queryKey: [PROJECTS, projectId] });
}

export function useGetPlanning(projectId: number) {
  return useQuery({
    queryKey: [PROJECTS, projectId, "planning"],
    queryFn: () =>
      requireData(
        injectQuery<PlanningDto>([PROJECTS, `/${projectId}`, PLANNING], {
          method: HttpMethod.GET,
        }),
        "La API no devolvió la planificación.",
      ),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: POLL_INTERVAL_MS,
  });
}

export function useCreateSprint() {
  return useMutation<
    SprintDto | null,
    Error,
    SaveSprintRequestDto & ProjectIdRequestDto
  >({
    mutationFn: ({ id, ...payload }) =>
      injectQuery<SprintDto>([PROJECTS, `/${id}`, SPRINTS], {
        method: HttpMethod.POST,
        body: JSON.stringify(payload),
      }),
    onSuccess: (_sprint, { id }) => invalidateProject(id),
    onError: handleMutationError,
  });
}

export function useUpdateSprint() {
  return useMutation<
    unknown,
    Error,
    SaveSprintRequestDto & SprintRequestDto
  >({
    mutationFn: ({ id, sprintId, ...payload }) =>
      injectQuery([PROJECTS, `/${id}`, SPRINTS, `/${sprintId}`], {
        method: HttpMethod.PATCH,
        body: JSON.stringify(payload),
      }),
    onSuccess: (_data, { id }) => invalidateProject(id),
    onError: handleMutationError,
  });
}

export function useDeleteSprint() {
  return useMutation<unknown, Error, SprintRequestDto>({
    mutationFn: ({ id, sprintId }) =>
      injectQuery([PROJECTS, `/${id}`, SPRINTS, `/${sprintId}`], {
        method: HttpMethod.DELETE,
      }),
    onSuccess: (_data, { id }) => invalidateProject(id),
    onError: handleMutationError,
  });
}

export function useStartSprint() {
  return useMutation<unknown, Error, SprintRequestDto>({
    mutationFn: ({ id, sprintId }) =>
      injectQuery([PROJECTS, `/${id}`, SPRINTS, `/${sprintId}`, START], {
        method: HttpMethod.POST,
      }),
    onSuccess: (_data, { id }) => invalidateProject(id),
    onError: handleMutationError,
  });
}

export function useCloseSprint() {
  return useMutation<unknown, Error, SprintRequestDto>({
    mutationFn: ({ id, sprintId }) =>
      injectQuery([PROJECTS, `/${id}`, SPRINTS, `/${sprintId}`, CLOSE], {
        method: HttpMethod.POST,
      }),
    onSuccess: (_data, { id }) => invalidateProject(id),
    onError: handleMutationError,
  });
}

export function useAssignIssueSprint() {
  return useMutation<
    unknown,
    Error,
    AssignSprintRequestDto & IssueRequestDto
  >({
    mutationFn: ({ id, issueId, sprintId }) =>
      injectQuery([PROJECTS, `/${id}`, ISSUES, `/${issueId}`, SPRINT], {
        method: HttpMethod.PATCH,
        body: JSON.stringify({ sprintId }),
      }),
    onSuccess: (_data, { id }) => invalidateProject(id),
    onError: handleMutationError,
  });
}
