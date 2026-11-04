import { useRef, useState } from "react";
import { ImagePlus, Maximize2, Trash2 } from "lucide-react";

import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { ConfirmDialogComponent } from "@/components/ui/confirm-dialog-component";
import { MediaViewerComponent } from "@/components/ui/media-viewer-component";
import { Skeleton } from "@/components/ui/skeleton";
import { notifyError } from "@/notifications/notify";
import { useI18n } from "@/i18n/use-i18n";
import {
  ATTACHMENT_IMAGE_MAX_BYTES,
  ATTACHMENT_MIME_TYPES,
  ATTACHMENT_VIDEO_MAX_BYTES,
  ATTACHMENTS_PER_COMMENT_MAX,
  ATTACHMENTS_PER_ISSUE_MAX,
  type AttachmentDto,
  type IssueRequestDto,
} from "@orbit/shared";
import { formatDuration, readMediaMetadata } from "../../../utils/media-metadata";
import {
  attachmentContentUrl,
  useDeleteAttachment,
  useGetAttachments,
  useUploadAttachment,
} from "../../../api/attachments-queries";

const MEGABYTE = 1024 * 1024;

interface IssueAttachmentsProps {
  issue: IssueRequestDto;
  commentId?: number;
  canWrite: boolean;
}

export default function IssueAttachments({
  issue,
  commentId,
  canWrite,
}: IssueAttachmentsProps) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const attachments = useGetAttachments(issue);
  const upload = useUploadAttachment();
  const remove = useDeleteAttachment();
  const [toDelete, setToDelete] = useState<AttachmentDto | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const isComment = commentId !== undefined;
  const max = isComment ? ATTACHMENTS_PER_COMMENT_MAX : ATTACHMENTS_PER_ISSUE_MAX;
  const items = (attachments.data ?? []).filter(
    (attachment) => (attachment.commentId ?? undefined) === commentId,
  );
  const isFull = items.length >= max;

  async function handleFiles(files: FileList | null) {
    const selected = Array.from(files ?? []);
    let remaining = max - items.length;

    for (const file of selected) {
      if (remaining <= 0) {
        notifyError(t("issues.attachments.limit", { max }));
        break;
      }

      const isVideo = file.type.startsWith("video/");
      const maxBytes = isVideo
        ? ATTACHMENT_VIDEO_MAX_BYTES
        : ATTACHMENT_IMAGE_MAX_BYTES;

      if (!(ATTACHMENT_MIME_TYPES as readonly string[]).includes(file.type)) {
        notifyError(t("issues.attachments.invalidType", { name: file.name }));
        continue;
      }

      if (file.size > maxBytes) {
        notifyError(
          t("issues.attachments.tooLarge", {
            name: file.name,
            max: maxBytes / MEGABYTE,
          }),
        );
        continue;
      }

      try {
        const metadata = await readMediaMetadata(file);
        await upload.mutateAsync({ ...issue, commentId, file, metadata });
        remaining -= 1;
      } catch {
        continue;
      }
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  if (!canWrite && !attachments.isPending && items.length === 0) {
    return null;
  }

  if (isComment && attachments.isPending) {
    return null;
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2
          className={cn(
            "font-semibold",
            isComment ? "text-xs text-muted-foreground" : "text-sm",
          )}
        >
          {t("issues.attachments.title")}
          {items.length > 0 && (
            <span className="ml-1.5 font-normal text-muted-foreground">
              {items.length} / {max}
            </span>
          )}
        </h2>
        {canWrite && (
          <>
            <input
              ref={inputRef}
              type="file"
              multiple
              hidden
              accept={ATTACHMENT_MIME_TYPES.join(",")}
              onChange={(event) => void handleFiles(event.currentTarget.files)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={upload.isPending}
              disabled={isFull}
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus />
              {t("issues.attachments.add")}
            </Button>
          </>
        )}
      </div>

      {attachments.isPending ? (
        <div aria-hidden="true" className="grid grid-cols-2 gap-3">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="aspect-video w-full rounded-lg" />
        </div>
      ) : items.length === 0 ? (
        !isComment && (
          <p className="text-sm text-muted-foreground">
            {t("issues.attachments.empty")}
          </p>
        )
      ) : (
        <ul
          className={cn(
            "grid grid-cols-2 gap-3",
            isComment && "sm:grid-cols-4",
          )}
        >
          {items.map((attachment, index) => {
            const url = attachmentContentUrl({
              ...issue,
              attachmentId: attachment.id,
            });

            return (
              <li
                key={attachment.id}
                className="group relative overflow-hidden rounded-lg border border-border bg-muted/40"
              >
                {attachment.kind === "video" ? (
                  <div className="relative">
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon-xs"
                      aria-label={t("issues.attachments.open", {
                        name: attachment.originalName,
                      })}
                      className="absolute top-1.5 right-1.5 z-10"
                      onClick={() => setViewerIndex(index)}
                    >
                      <Maximize2 />
                    </Button>
                  <video
                    src={url}
                    controls
                    preload="metadata"
                    aria-label={attachment.originalName}
                    className="aspect-video w-full bg-black object-contain"
                  />
                  </div>
                ) : (
                  <button
                    type="button"
                    aria-label={t("issues.attachments.open", {
                      name: attachment.originalName,
                    })}
                    className="block w-full cursor-zoom-in"
                    onClick={() => setViewerIndex(index)}
                  >
                    <img
                      src={url}
                      alt=""
                      loading="lazy"
                      className="aspect-video w-full object-cover"
                    />
                  </button>
                )}
                <div className="flex items-center justify-between gap-2 px-2.5 py-1.5">
                  <span className="flex min-w-0 flex-col">
                    <span
                      className="truncate text-xs text-muted-foreground"
                      title={attachment.originalName}
                    >
                      {attachment.originalName}
                    </span>
                    {(attachment.width !== null ||
                      attachment.durationSeconds !== null) && (
                      <span className="truncate text-[0.7rem] text-muted-foreground/70">
                        {[
                          attachment.width !== null && attachment.height !== null
                            ? `${attachment.width}×${attachment.height}`
                            : null,
                          attachment.durationSeconds !== null
                            ? formatDuration(attachment.durationSeconds)
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    )}
                  </span>
                  {canWrite && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("issues.attachments.remove", {
                        name: attachment.originalName,
                      })}
                      onClick={() => setToDelete(attachment)}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <MediaViewerComponent
        items={items.map((attachment) => ({
          id: attachment.id,
          kind: attachment.kind,
          src: attachmentContentUrl({ ...issue, attachmentId: attachment.id }),
          name: attachment.originalName,
        }))}
        index={viewerIndex}
        onIndexChange={setViewerIndex}
      />

      <ConfirmDialogComponent
        open={toDelete !== null}
        title={t("issues.attachments.deleteTitle")}
        description={t("issues.attachments.deleteDescription", {
          name: toDelete?.originalName ?? "",
        })}
        confirmLabel={t("issues.attachments.deleteConfirm")}
        isPending={remove.isPending}
        destructive
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          remove.mutate(
            { ...issue, commentId, attachmentId: toDelete.id },
            { onSettled: () => setToDelete(null) },
          );
        }}
      />
    </section>
  );
}
