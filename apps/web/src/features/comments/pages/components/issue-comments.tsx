import { useState, type SubmitEvent } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialogComponent } from "@/components/ui/confirm-dialog-component";
import { UserAvatarComponent } from "@/components/ui/user-avatar-component";
import {
  COMMENT_MAX_LENGTH,
  type CommentDto,
  type IssueRequestDto,
} from "@orbit/shared";
import {
  useCreateComment,
  useDeleteComment,
  useGetComments,
  useUpdateComment,
} from "../../api/queries";
import { useI18n } from "@/i18n/use-i18n";

interface IssueCommentsProps {
  issue: IssueRequestDto;
  currentUserId?: number;
  canWrite: boolean;
}

export default function IssueComments({
  issue,
  currentUserId,
  canWrite,
}: IssueCommentsProps) {
  const { t, locale } = useI18n();
  const comments = useGetComments(issue);
  const createComment = useCreateComment();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [commentToDelete, setCommentToDelete] = useState<CommentDto | null>(
    null,
  );

  function handleCreate(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const body = draft.trim();

    if (!body) return;

    createComment.mutate({ ...issue, body }, { onSuccess: () => setDraft("") });
  }

  function handleUpdate(
    event: SubmitEvent<HTMLFormElement>,
    comment: CommentDto,
  ) {
    event.preventDefault();

    const body = new FormData(event.currentTarget).get("body");

    if (typeof body !== "string") return;

    updateComment.mutate(
      { ...issue, commentId: comment.id, body },
      { onSuccess: () => setEditingId(null) },
    );
  }

  return (
    <section
      aria-label={t("issues.comments.section")}
      className="flex flex-col gap-4"
    >
      <h2 className="flex items-baseline gap-2 text-sm font-semibold">
        {t("issues.comments.section")}
        {comments.data && (
          <span className="text-xs font-normal text-muted-foreground">
            {comments.data.length}
          </span>
        )}
      </h2>

      {comments.isLoading && (
        <div className="flex flex-col gap-3" aria-busy="true">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      )}
      {comments.data?.length === 0 && (
        <p className="rounded-lg border border-dashed border-border px-3 py-5 text-center text-sm text-muted-foreground">
          {t("issues.comments.empty")}
        </p>
      )}

      <ul className="flex flex-col gap-5">
        {comments.data?.map((comment) => {
          const isAuthor = comment.authorId === currentUserId;

          return (
            <li key={comment.id} className="flex gap-3">
              <UserAvatarComponent
                name={comment.authorName}
                avatarUrl={comment.authorAvatarUrl}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                  <strong className="font-semibold">
                    {comment.authorName}
                  </strong>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleString(locale, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                    {comment.updatedAt !== comment.createdAt &&
                      ` · ${t("issues.comments.edited")}`}
                  </span>
                  {canWrite && isAuthor && editingId !== comment.id && (
                    <span className="ml-auto flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => setEditingId(comment.id)}
                      >
                        {t("common.edit")}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        className="hover:bg-destructive/10 hover:text-destructive"
                        disabled={deleteComment.isPending}
                        onClick={() => setCommentToDelete(comment)}
                      >
                        {t("common.delete")}
                      </Button>
                    </span>
                  )}
                </div>
                {editingId === comment.id ? (
                  <form
                    onSubmit={(event) => handleUpdate(event, comment)}
                    className="mt-2 flex flex-col gap-2"
                  >
                    <Textarea
                      name="body"
                      aria-label={t("issues.comments.editLabel")}
                      defaultValue={comment.body}
                      maxLength={COMMENT_MAX_LENGTH}
                      rows={3}
                      required
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        loading={updateComment.isPending}
                      >
                        {t("common.save")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(null)}
                      >
                        {t("common.cancel")}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere] text-foreground/90">
                    {comment.body}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {canWrite && (
        <form onSubmit={handleCreate} className="flex gap-3">
          <span className="mt-1 size-9 shrink-0" aria-hidden="true" />
          <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-xl border border-input bg-card p-3 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
            <Textarea
              aria-label={t("issues.comments.newLabel")}
              placeholder={t("issues.comments.placeholder")}
              value={draft}
              onChange={(event) => setDraft(event.currentTarget.value)}
              maxLength={COMMENT_MAX_LENGTH}
              rows={2}
              className="min-h-14 resize-none border-0 bg-transparent p-0 focus-visible:ring-0"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                {draft.length} / {COMMENT_MAX_LENGTH}
              </span>
              <Button
                type="submit"
                size="sm"
                loading={createComment.isPending}
                disabled={!draft.trim()}
              >
                {t("issues.comments.submit")}
              </Button>
            </div>
          </div>
        </form>
      )}

      <ConfirmDialogComponent
        open={commentToDelete !== null}
        title={t("issues.comments.deleteDialog.title")}
        description={t("issues.comments.deleteDialog.description")}
        confirmLabel={t("issues.comments.deleteDialog.confirm")}
        isPending={deleteComment.isPending}
        destructive
        onClose={() => setCommentToDelete(null)}
        onConfirm={() => {
          if (!commentToDelete) return;
          deleteComment.mutate(
            { ...issue, commentId: commentToDelete.id },
            { onSettled: () => setCommentToDelete(null) },
          );
        }}
      />
    </section>
  );
}
