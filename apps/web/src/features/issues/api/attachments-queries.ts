import {
  handleMutationError,
  HttpMethod,
  injectQuery,
  requireData,
  resolveAssetUrl,
} from "@/api/config";
import { POLL_INTERVAL_MS, queryClient } from "@/api/tanstack-query-config";
import { ATTACHMENTS, COMMENTS, ISSUES, PROJECTS } from "@/api/uris";
import type {
  AttachmentDto,
  AttachmentRequestDto,
  IssueRequestDto,
} from "@orbit/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import { t } from "@/i18n/locale-store";
import type { MediaMetadata } from "../utils/media-metadata";

const UPLOAD_TIMEOUT_MS = 120_000;

const attachmentsKey = ({ id, issueId }: IssueRequestDto) =>
  [PROJECTS, id, "issues", issueId, "attachments"] as const;

const attachmentsPath = ({
  id,
  issueId,
  commentId,
}: IssueRequestDto & { commentId?: number }) => [
  PROJECTS,
  `/${id}`,
  ISSUES,
  `/${issueId}`,
  ...(commentId === undefined ? [] : [COMMENTS, `/${commentId}`]),
  ATTACHMENTS,
];

export function attachmentContentUrl({
  id,
  issueId,
  attachmentId,
}: AttachmentRequestDto) {
  return resolveAssetUrl(
    `/${PROJECTS.slice(1)}/${id}/${ISSUES.slice(1)}/${issueId}/${ATTACHMENTS.slice(1)}/${attachmentId}`,
  );
}

function invalidateAttachments(issue: IssueRequestDto) {
  return queryClient.invalidateQueries({ queryKey: attachmentsKey(issue) });
}

export function useGetAttachments(issue: IssueRequestDto) {
  return useQuery({
    queryKey: attachmentsKey(issue),
    queryFn: () =>
      requireData(
        injectQuery<AttachmentDto[]>(attachmentsPath(issue), {
          method: HttpMethod.GET,
        }),
        t("api.emptyAttachments"),
      ),
    refetchInterval: POLL_INTERVAL_MS,
  });
}

export function useUploadAttachment() {
  return useMutation<
    AttachmentDto | null,
    Error,
    IssueRequestDto & {
      commentId?: number;
      file: File;
      metadata?: MediaMetadata;
    }
  >({
    meta: { successMessage: "toasts.attachmentAdded" },
    mutationFn: ({ id, issueId, commentId, file, metadata }) =>
      injectQuery<AttachmentDto>(attachmentsPath({ id, issueId, commentId }), {
        method: HttpMethod.POST,
        headers: {
          "Content-Type": file.type,
          "X-File-Name": encodeURIComponent(file.name),
          ...(metadata?.width != null && { "X-Media-Width": String(metadata.width) }),
          ...(metadata?.height != null && {
            "X-Media-Height": String(metadata.height),
          }),
          ...(metadata?.durationSeconds != null && {
            "X-Media-Duration": String(metadata.durationSeconds),
          }),
        },
        body: file,
        signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS),
      }),
    onSuccess: (_attachment, issue) => invalidateAttachments(issue),
    onError: handleMutationError,
  });
}

export function useDeleteAttachment() {
  return useMutation<
    unknown,
    Error,
    AttachmentRequestDto & { commentId?: number }
  >({
    meta: { successMessage: "toasts.attachmentDeleted" },
    mutationFn: ({ id, issueId, commentId, attachmentId }) =>
      injectQuery([...attachmentsPath({ id, issueId, commentId }), `/${attachmentId}`], {
        method: HttpMethod.DELETE,
      }),
    onSuccess: (_data, issue) => invalidateAttachments(issue),
    onError: handleMutationError,
  });
}
