import { and, asc, count, eq, isNull, type SQL } from "drizzle-orm";
import type {
  AttachmentDto,
  AttachmentRequestDto,
  IssueRequestDto,
} from "@orbit/shared";
import type {
  AttachmentFile,
  AttachmentRepository,
  AttachmentTarget,
  CreateAttachmentCommand,
} from "../../../application/attachment/ports/attachment-repository.port.js";
import type { DbContext } from "../db-context.js";
import { attachments } from "../schema/attachments.js";
import { files } from "../schema/files.js";
import { issues } from "../schema/issues.js";
import { users } from "../schema/users.js";

const attachmentColumns = {
  id: attachments.id,
  issueId: attachments.issueId,
  commentId: attachments.commentId,
  mimeType: files.mimeType,
  originalName: files.originalName,
  sizeBytes: files.sizeBytes,
  width: files.width,
  height: files.height,
  durationSeconds: files.durationSeconds,
  uploaderName: users.name,
  uploaderLastName: users.lastName,
  createdAt: attachments.createdAt,
};

function toDto(row: {
  id: number;
  issueId: number;
  commentId: number | null;
  mimeType: string;
  originalName: string;
  sizeBytes: bigint;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  uploaderName: string;
  uploaderLastName: string;
  createdAt: Date;
}): AttachmentDto {
  return {
    id: row.id,
    issueId: row.issueId,
    commentId: row.commentId,
    kind: row.mimeType.startsWith("video/") ? "video" : "image",
    mimeType: row.mimeType,
    originalName: row.originalName,
    sizeBytes: Number(row.sizeBytes),
    width: row.width,
    height: row.height,
    durationSeconds: row.durationSeconds,
    uploadedByName: `${row.uploaderName} ${row.uploaderLastName}`,
    createdAt: row.createdAt.toISOString(),
  };
}

export class DBAttachmentRepository implements AttachmentRepository {
  constructor(private readonly context: DbContext) {}

  private get db() {
    return this.context.db;
  }

  private belongsTo({
    id,
    issueId,
    attachmentId,
    commentId,
  }: AttachmentRequestDto) {
    return and(
      eq(attachments.id, attachmentId),
      eq(attachments.issueId, issueId),
      eq(issues.projectId, id),
      this.matchesComment(commentId),
    );
  }

  private matchesComment(commentId: number | null | undefined): SQL | undefined {
    if (commentId === undefined) {
      return undefined;
    }

    return commentId === null
      ? isNull(attachments.commentId)
      : eq(attachments.commentId, commentId);
  }

  async create({
    issueId,
    commentId,
    fileId,
    actorUserId,
  }: CreateAttachmentCommand): Promise<number> {
    const [row] = await this.db
      .insert(attachments)
      .values({
        issueId,
        commentId,
        fileId,
        uploadedByUserId: actorUserId,
        createdByUserId: actorUserId,
      })
      .returning({ id: attachments.id });

    return row.id;
  }

  async countByTarget({ issueId, commentId }: AttachmentTarget): Promise<number> {
    const [row] = await this.db
      .select({ total: count() })
      .from(attachments)
      .where(
        and(eq(attachments.issueId, issueId), this.matchesComment(commentId)),
      );

    return row.total;
  }

  async findAllByIssue({ id, issueId }: IssueRequestDto) {
    const rows = await this.db
      .select(attachmentColumns)
      .from(attachments)
      .innerJoin(issues, eq(issues.id, attachments.issueId))
      .innerJoin(files, eq(files.id, attachments.fileId))
      .innerJoin(users, eq(users.id, attachments.uploadedByUserId))
      .where(and(eq(attachments.issueId, issueId), eq(issues.projectId, id)))
      .orderBy(asc(attachments.createdAt), asc(attachments.id));

    return rows.map(toDto);
  }

  async findDtoById(query: AttachmentRequestDto) {
    const [row] = await this.db
      .select(attachmentColumns)
      .from(attachments)
      .innerJoin(issues, eq(issues.id, attachments.issueId))
      .innerJoin(files, eq(files.id, attachments.fileId))
      .innerJoin(users, eq(users.id, attachments.uploadedByUserId))
      .where(this.belongsTo(query))
      .limit(1);

    return row ? toDto(row) : null;
  }

  async findFileById(
    query: AttachmentRequestDto,
  ): Promise<AttachmentFile | null> {
    const [row] = await this.db
      .select({
        attachmentId: attachments.id,
        fileId: files.id,
        storageKey: files.storageKey,
        mimeType: files.mimeType,
        originalName: files.originalName,
        commentId: attachments.commentId,
      })
      .from(attachments)
      .innerJoin(issues, eq(issues.id, attachments.issueId))
      .innerJoin(files, eq(files.id, attachments.fileId))
      .where(this.belongsTo(query))
      .limit(1);

    return row ?? null;
  }

  async findFilesByComment({
    id,
    issueId,
    commentId,
  }: AttachmentTarget & { commentId: number }): Promise<AttachmentFile[]> {
    return this.db
      .select({
        attachmentId: attachments.id,
        fileId: files.id,
        storageKey: files.storageKey,
        mimeType: files.mimeType,
        originalName: files.originalName,
        commentId: attachments.commentId,
      })
      .from(attachments)
      .innerJoin(issues, eq(issues.id, attachments.issueId))
      .innerJoin(files, eq(files.id, attachments.fileId))
      .where(
        and(
          eq(attachments.issueId, issueId),
          eq(issues.projectId, id),
          eq(attachments.commentId, commentId),
        ),
      );
  }

  async delete({ attachmentId }: AttachmentRequestDto): Promise<void> {
    await this.db.delete(attachments).where(eq(attachments.id, attachmentId));
  }

  async deleteByComment({ commentId }: { commentId: number }): Promise<void> {
    await this.db.delete(attachments).where(eq(attachments.commentId, commentId));
  }
}
