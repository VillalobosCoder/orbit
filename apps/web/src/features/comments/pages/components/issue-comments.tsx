import { useState, type SubmitEvent } from "react";

import { Button } from "@/components/ui/button";
import type { CommentDto, IssueRequestDto } from "@orbit/shared";
import {
  useCreateComment,
  useDeleteComment,
  useGetComments,
  useUpdateComment,
} from "../../api/queries";

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
  const comments = useGetComments(issue);
  const createComment = useCreateComment();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();
  const [editingId, setEditingId] = useState<number | null>(null);

  function handleCreate(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const body = new FormData(form).get("body");

    if (typeof body !== "string") return;

    createComment.mutate({ ...issue, body }, { onSuccess: () => form.reset() });
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

  function handleDelete(comment: CommentDto) {
    if (window.confirm("¿Seguro que quieres eliminar este comentario?")) {
      deleteComment.mutate({ ...issue, commentId: comment.id });
    }
  }

  return (
    <section>
      <h2>Comentarios</h2>
      {comments.isLoading && <p>Cargando comentarios...</p>}
      {comments.isError && <p role="alert">{comments.error.message}</p>}
      {comments.data?.length === 0 && <p>Aún no hay comentarios.</p>}
      <ul className="space-y-3">
        {comments.data?.map((comment) => {
          const isAuthor = comment.authorId === currentUserId;

          return (
            <li key={comment.id} className="rounded-md border border-border p-3">
              <div className="text-xs text-muted-foreground">
                {comment.authorName} ·{" "}
                {new Date(comment.createdAt).toLocaleString()}
                {comment.updatedAt !== comment.createdAt && " · editado"}
              </div>
              {editingId === comment.id ? (
                <form onSubmit={(event) => handleUpdate(event, comment)}>
                  <textarea
                    name="body"
                    defaultValue={comment.body}
                    maxLength={10000}
                    rows={3}
                    required
                    className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <Button type="submit" disabled={updateComment.isPending}>
                      {updateComment.isPending ? "Guardando..." : "Guardar"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                  {updateComment.isError && (
                    <p role="alert">{updateComment.error.message}</p>
                  )}
                </form>
              ) : (
                <>
                  <p className="whitespace-pre-wrap text-sm">{comment.body}</p>
                  {canWrite && isAuthor && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingId(comment.id)}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={deleteComment.isPending}
                        onClick={() => handleDelete(comment)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>
      {deleteComment.isError && (
        <p role="alert">{deleteComment.error.message}</p>
      )}
      {canWrite && (
        <form onSubmit={handleCreate}>
          <label htmlFor="new-comment">Nuevo comentario</label>
          <textarea
            id="new-comment"
            name="body"
            maxLength={10000}
            rows={3}
            required
            className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
          />
          <Button type="submit" disabled={createComment.isPending}>
            {createComment.isPending ? "Comentando..." : "Comentar"}
          </Button>
          {createComment.isError && (
            <p role="alert">{createComment.error.message}</p>
          )}
        </form>
      )}
    </section>
  );
}
