import {
  handleMutationError,
  HttpMethod,
  injectQuery,
  requireData,
} from "@/api/config";
import { queryClient } from "@/api/tanstack-query-config";
import { PROJECTS } from "@/api/uris";
import type {
  CommentDto,
  CommentRequestDto,
  IssueRequestDto,
  SaveCommentRequestDto,
} from "@orbit/shared";
import { useMutation, useQuery } from "@tanstack/react-query";

const commentsKey = ({ id, issueId }: IssueRequestDto) =>
  [PROJECTS, id, "issues", issueId, "comments"] as const;

const commentsPath = ({ id, issueId }: IssueRequestDto) => [
  PROJECTS,
  `/${id}`,
  "/issues",
  `/${issueId}`,
  "/comments",
];

function invalidateComments(issue: IssueRequestDto) {
  return queryClient.invalidateQueries({ queryKey: commentsKey(issue) });
}

export function useGetComments(issue: IssueRequestDto) {
  return useQuery({
    queryKey: commentsKey(issue),
    queryFn: () =>
      requireData(
        injectQuery<CommentDto[]>(commentsPath(issue), {
          method: HttpMethod.GET,
        }),
        "La API no devolvió los comentarios.",
      ),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useCreateComment() {
  return useMutation<
    CommentDto | null,
    Error,
    SaveCommentRequestDto & IssueRequestDto
  >({
    mutationFn: ({ body, ...issue }) =>
      injectQuery<CommentDto>(commentsPath(issue), {
        method: HttpMethod.POST,
        body: JSON.stringify({ body }),
      }),
    onSuccess: (_comment, issue) => invalidateComments(issue),
    onError: handleMutationError,
  });
}

export function useUpdateComment() {
  return useMutation<
    unknown,
    Error,
    SaveCommentRequestDto & CommentRequestDto
  >({
    mutationFn: ({ body, commentId, ...issue }) =>
      injectQuery([...commentsPath(issue), `/${commentId}`], {
        method: HttpMethod.PATCH,
        body: JSON.stringify({ body }),
      }),
    onSuccess: (_data, issue) => invalidateComments(issue),
    onError: handleMutationError,
  });
}

export function useDeleteComment() {
  return useMutation<unknown, Error, CommentRequestDto>({
    mutationFn: ({ commentId, ...issue }) =>
      injectQuery([...commentsPath(issue), `/${commentId}`], {
        method: HttpMethod.DELETE,
      }),
    onSuccess: (_data, issue) => invalidateComments(issue),
    onError: handleMutationError,
  });
}
