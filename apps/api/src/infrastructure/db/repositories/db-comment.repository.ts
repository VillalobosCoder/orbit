import { and, asc, eq } from "drizzle-orm";
import type {
  CommentDto,
  CommentRequestDto,
  IssueRequestDto,
} from "@orbit/shared";
import type { CommentRepository } from "../../../application/comment/ports/comment-repository.port.js";
import { Comment } from "../../../domain/comment/comment.entity.js";
import { CommentNotFoundError } from "../../../domain/comment/comment.errors.js";
import type { DbContext } from "../db-context.js";
import { comments } from "../schema/comments.js";
import { issues } from "../schema/issues.js";
import { users } from "../schema/users.js";
import type { ActorUserId } from "../../../application/shared/actor.js";

const commentColumns = {
  id: comments.id,
  issueId: comments.issueId,
  authorId: comments.authorId,
  authorName: users.name,
  authorLastName: users.lastName,
  body: comments.body,
  createdAt: comments.createdAt,
  updatedAt: comments.updatedAt,
};

function toDto(row: {
  id: number;
  issueId: number;
  authorId: number;
  authorName: string;
  authorLastName: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}): CommentDto {
  return {
    id: row.id,
    issueId: row.issueId,
    authorId: row.authorId,
    authorName: `${row.authorName} ${row.authorLastName}`,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class DBCommentRepository implements CommentRepository {
  constructor(private readonly context: DbContext) {}

  private get db() {
    return this.context.db;
  }

  private belongsTo({ id, issueId, commentId }: CommentRequestDto) {
    return and(
      eq(comments.id, commentId),
      eq(comments.issueId, issueId),
      eq(issues.projectId, id),
    );
  }

  async save(comment: Comment, actorUserId: ActorUserId): Promise<number> {
    const [created] = await this.db
      .insert(comments)
      .values({
        issueId: comment.issueId,
        authorId: comment.authorId,
        body: comment.body,
        createdByUserId: actorUserId,
      })
      .returning({ id: comments.id });

    return created.id;
  }

  async findAllByIssue({ id, issueId }: IssueRequestDto): Promise<CommentDto[]> {
    const rows = await this.db
      .select(commentColumns)
      .from(comments)
      .innerJoin(issues, eq(issues.id, comments.issueId))
      .innerJoin(users, eq(users.id, comments.authorId))
      .where(and(eq(comments.issueId, issueId), eq(issues.projectId, id)))
      .orderBy(asc(comments.createdAt), asc(comments.id));

    return rows.map(toDto);
  }

  async findDtoById(query: CommentRequestDto): Promise<CommentDto | null> {
    const [row] = await this.db
      .select(commentColumns)
      .from(comments)
      .innerJoin(issues, eq(issues.id, comments.issueId))
      .innerJoin(users, eq(users.id, comments.authorId))
      .where(this.belongsTo(query))
      .limit(1);

    return row ? toDto(row) : null;
  }

  async findById(query: CommentRequestDto): Promise<Comment | null> {
    const [row] = await this.db
      .select({
        id: comments.id,
        issueId: comments.issueId,
        authorId: comments.authorId,
        body: comments.body,
      })
      .from(comments)
      .innerJoin(issues, eq(issues.id, comments.issueId))
      .where(this.belongsTo(query))
      .limit(1);

    return row ? Comment.fromPersistence(row) : null;
  }

  async update(comment: Comment, actorUserId: ActorUserId): Promise<void> {
    const [row] = await this.db
      .update(comments)
      .set({
        body: comment.body,
        updatedAt: new Date(),
        updatedByUserId: actorUserId,
      })
      .where(eq(comments.id, comment.id!))
      .returning({ id: comments.id });

    if (!row) {
      throw new CommentNotFoundError(comment.id!);
    }
  }

  async delete({ commentId }: CommentRequestDto): Promise<void> {
    const [row] = await this.db
      .delete(comments)
      .where(eq(comments.id, commentId))
      .returning({ id: comments.id });

    if (!row) {
      throw new CommentNotFoundError(commentId);
    }
  }
}
