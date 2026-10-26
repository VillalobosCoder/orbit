import {
  handleMutationError,
  HttpMethod,
  injectQuery,
  requireData,
} from "@/api/config";
import { queryClient } from "@/api/tanstack-query-config";
import { AVAILABLE_USERS, MEMBERS, PROJECTS } from "@/api/uris";
import type {
  AddProjectMemberRequestDto,
  CreateProjectRequestDto,
  ProjectDto,
  ProjectMemberDto,
  ProjectMemberRequestDto,
  UpdateProjectRequestDto,
} from "@orbit/shared";
import { useMutation, useQuery } from "@tanstack/react-query";

function invalidateProjects() {
  queryClient.invalidateQueries({ queryKey: [PROJECTS] });
}

export function useGetProjects({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: [PROJECTS],
    enabled,
    queryFn: () =>
      requireData(
        injectQuery<ProjectDto[]>([PROJECTS], { method: HttpMethod.GET }),
        "La API no devolvió los proyectos.",
      ),
  });
}

export function useGetProject(id: number) {
  return useQuery({
    queryKey: [PROJECTS, id],
    queryFn: () =>
      requireData(
        injectQuery<ProjectDto>([PROJECTS, `/${id}`], {
          method: HttpMethod.GET,
        }),
        "La API no devolvió el proyecto.",
      ),
  });
}

export function useGetProjectMembers(id: number) {
  return useQuery({
    queryKey: [PROJECTS, id, "members"],
    queryFn: () =>
      requireData(
        injectQuery<ProjectMemberDto[]>([PROJECTS, `/${id}`, MEMBERS], {
          method: HttpMethod.GET,
        }),
        "La API no devolvió los miembros.",
      ),
  });
}

export function useGetAvailableUsers(id: number, { enabled }: { enabled: boolean }) {
  return useQuery({
    queryKey: [PROJECTS, id, AVAILABLE_USERS],
    enabled,
    queryFn: () =>
      requireData(
        injectQuery<ProjectMemberDto[]>(
          [PROJECTS, `/${id}`, AVAILABLE_USERS],
          { method: HttpMethod.GET },
        ),
        "La API no devolvió los usuarios disponibles.",
      ),
  });
}

export function useCreateProject() {
  return useMutation<ProjectDto | null, Error, CreateProjectRequestDto>({
    mutationFn: (payload) =>
      injectQuery<ProjectDto>([PROJECTS], {
        method: HttpMethod.POST,
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidateProjects,
    onError: handleMutationError,
  });
}

export function useUpdateProject() {
  return useMutation<
    unknown,
    Error,
    UpdateProjectRequestDto & { id: number }
  >({
    mutationFn: ({ id, ...payload }) =>
      injectQuery([PROJECTS, `/${id}`], {
        method: HttpMethod.PATCH,
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidateProjects,
    onError: handleMutationError,
  });
}

export function useDeleteProject() {
  return useMutation<unknown, Error, number>({
    mutationFn: (id) =>
      injectQuery([PROJECTS, `/${id}`], { method: HttpMethod.DELETE }),
    onSuccess: invalidateProjects,
    onError: handleMutationError,
  });
}

export function useAddProjectMember() {
  return useMutation<unknown, Error, ProjectMemberRequestDto>({
    mutationFn: ({ id, userId }) => {
      const payload: AddProjectMemberRequestDto = { userId };

      return injectQuery([PROJECTS, `/${id}`, AVAILABLE_USERS], {
        method: HttpMethod.POST,
        body: JSON.stringify(payload),
      });
    },
    onSuccess: invalidateProjects,
    onError: handleMutationError,
  });
}

export function useRemoveProjectMember() {
  return useMutation<unknown, Error, ProjectMemberRequestDto>({
    mutationFn: ({ id, userId }) =>
      injectQuery([PROJECTS, `/${id}`, MEMBERS, `/${userId}`], {
        method: HttpMethod.DELETE,
      }),
    onSuccess: invalidateProjects,
    onError: handleMutationError,
  });
}
