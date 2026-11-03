import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialogComponent } from "@/components/ui/confirm-dialog-component";
import { Skeleton } from "@/components/ui/skeleton";
import { notifyError } from "@/notifications/notify";
import { useI18n } from "@/i18n/use-i18n";
import {
  ATTACHMENT_IMAGE_MAX_BYTES,
  ATTACHMENT_MIME_TYPES,
  ATTACHMENT_VIDEO_MAX_BYTES,
  ATTACHMENTS_PER_ISSUE_MAX,
  type AttachmentDto,
  type IssueRequestDto,
} from "@orbit/shared";
import {
  attachmentContentUrl,
  useDeleteAttachment,
  useGetAttachments,
  useUploadAttachment,
} from "../../api/attachments-queries";

const MEGABYTE = 1024 * 1024;

interface IssueAttachmentsProps {
  issue: IssueRequestDto;
  canWrite: boolean;
}

export default function IssueAttachments({
  issue,
  canWrite,
}: IssueAttachmentsProps) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const attachments = useGetAttachments(issue);
  const upload = useUploadAttachment();
  const remove = useDeleteAttachment();
  const [toDelete, setToDelete] = useState<AttachmentDto | null>(null);
  const items = attachments.data ?? [];
  const isFull = items.length >= ATTACHMENTS_PER_ISSUE_MAX;

  async function handleFiles(files: FileList | null) {
    const selected = Array.from(files ?? []);
    let remaining = ATTACHMENTS_PER_ISSUE_MAX - items.length;

    for (const file of selected) {
      if (remaining <= 0) {
        notifyError(t("issues.attachments.limit", { max: ATTACHMENTS_PER_ISSUE_MAX }));
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
        await upload.mutateAsync({ ...issue, file });
        remaining -= 1;
      } catch {
      }
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  if (!canWrite && !attachments.isPending && items.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">
          {t("issues.attachments.title")}
          {items.length > 0 && (
            <span className="ml-1.5 font-normal text-muted-foreground">
              {items.length} / {ATTACHMENTS_PER_ISSUE_MAX}
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
        <p className="text-sm text-muted-foreground">
          {t("issues.attachments.empty")}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3">
          {items.map((attachment) => {
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
                  <video
                    src={url}
                    controls
                    preload="metadata"
                    aria-label={attachment.originalName}
                    className="aspect-video w-full bg-black object-contain"
                  />
                ) : (
                  <a href={url} target="_blank" rel="noreferrer">
                    <img
                      src={url}
                      alt={attachment.originalName}
                      loading="lazy"
                      className="aspect-video w-full object-cover"
                    />
                  </a>
                )}
                <div className="flex items-center justify-between gap-2 px-2.5 py-1.5">
                  <span
                    className="min-w-0 truncate text-xs text-muted-foreground"
                    title={attachment.originalName}
                  >
                    {attachment.originalName}
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
            { ...issue, attachmentId: toDelete.id },
            { onSettled: () => setToDelete(null) },
          );
        }}
      />
    </section>
  );
}
