import { useState, type SubmitEvent } from "react";
import { CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialogComponent } from "@/shared/ui/custom-components/confirm-dialog-component";
import { UserAvatarComponent } from "@/shared/ui/custom-components/user-avatar-component";
import type { CommentDto, IssueRequestDto } from "@orbit/shared";
import {
  useCreateComment,
  useDeleteComment,
  useGetComments,
  useUpdateComment,
} from "../../api/queries";

const MAX_LENGTH = 10000;

interface IssueCommentsProps {
  issue: IssueRequestDto;
  currentUserId?: number;
  canWrite: boolean;
}

function ErrorAlert({ children }: { children: string }) {
  return (
    <p
      role="alert"
      className="flex items-center gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
    >
      <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}

export default function IssueComments({
  issue,
  currentUserId,
  canWrite,
}: IssueCommentsProps) {
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
    <section aria-label="Comentarios" className="flex flex-col gap-4">
      <h2 className="flex items-baseline gap-2 text-sm font-semibold">
        Comentarios
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
      {comments.isError && <ErrorAlert>{comments.error.message}</ErrorAlert>}
      {comments.data?.length === 0 && (
        <p className="rounded-lg border border-dashed border-border px-3 py-5 text-center text-sm text-muted-foreground">
          Aún no hay comentarios.
        </p>
      )}

      <ul className="flex flex-col gap-5">
        {comments.data?.map((comment) => {
          const isAuthor = comment.authorId === currentUserId;

          return (
            <li key={comment.id} className="flex gap-3">
              <UserAvatarComponent name={comment.authorName} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                  <strong className="font-semibold">
                    {comment.authorName}
                  </strong>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleString("es", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                    {comment.updatedAt !== comment.createdAt && " · editado"}
                  </span>
                  {canWrite && isAuthor && editingId !== comment.id && (
                    <span className="ml-auto flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => setEditingId(comment.id)}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        className="hover:bg-destructive/10 hover:text-destructive"
                        disabled={deleteComment.isPending}
                        onClick={() => setCommentToDelete(comment)}
                      >
                        Eliminar
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
                      aria-label="Editar comentario"
                      defaultValue={comment.body}
                      maxLength={MAX_LENGTH}
                      rows={3}
                      required
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={updateComment.isPending}
                      >
                        {updateComment.isPending ? "Guardando..." : "Guardar"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                    {updateComment.isError && (
                      <ErrorAlert>{updateComment.error.message}</ErrorAlert>
                    )}
                  </form>
                ) : (
                  <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                    {comment.body}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {deleteComment.isError && (
        <ErrorAlert>{deleteComment.error.message}</ErrorAlert>
      )}

      {canWrite && (
        <form onSubmit={handleCreate} className="flex gap-3">
          <span className="mt-1 size-9 shrink-0" aria-hidden="true" />
          <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-xl border border-input bg-card p-3 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
            <Textarea
              aria-label="Nuevo comentario"
              placeholder="Escribe un comentario…"
              value={draft}
              onChange={(event) => setDraft(event.currentTarget.value)}
              maxLength={MAX_LENGTH}
              rows={2}
              className="min-h-14 resize-none border-0 bg-transparent p-0 focus-visible:ring-0"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                {draft.length} / {MAX_LENGTH.toLocaleString("es")}
              </span>
              <Button
                type="submit"
                size="sm"
                disabled={createComment.isPending || !draft.trim()}
              >
                {createComment.isPending ? "Comentando..." : "Comentar"}
              </Button>
            </div>
            {createComment.isError && (
              <ErrorAlert>{createComment.error.message}</ErrorAlert>
            )}
          </div>
        </form>
      )}

      <ConfirmDialogComponent
        open={commentToDelete !== null}
        title="¿Eliminar comentario?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar comentario"
        pendingLabel="Eliminando..."
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
