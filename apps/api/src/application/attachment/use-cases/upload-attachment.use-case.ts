import { randomUUID } from "node:crypto";
import {
  ATTACHMENTS_PER_COMMENT_MAX,
  ATTACHMENTS_PER_ISSUE_MAX,
  type AttachmentDto,
  type IssueRequestDto,
} from "@orbit/shared";
import {
  AttachmentNotFoundError,
  TooManyAttachmentsError,
} from "../../../domain/attachment/attachment.errors.js";
import { AttachmentMedia } from "../../../domain/attachment/value-objects/attachment-media.vo.js";
import { IssueNotFoundError } from "../../../domain/issue/issue.errors.js";
import { CommentNotFoundError } from "../../../domain/comment/comment.errors.js";
import type { CommentRepository } from "../../comment/ports/comment-repository.port.js";
import type { FileRepository } from "../../file/ports/file-repository.port.js";
import type { FileStorage } from "../../file/ports/file-storage.port.js";
import type { IssueRepository } from "../../issue/ports/issue-repository.port.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { Actor } from "../../shared/actor.js";
import type { TransactionManager } from "../../shared/ports/transaction-manager.port.js";
import type { AttachmentRepository } from "../ports/attachment-repository.port.js";
import { requireProjectMember } from "../../project/utils/require-project-member.js";

export type UploadAttachmentInput = IssueRequestDto &
  Actor & {
    commentId: number | null;
    content: Buffer;
    originalName: string;
    width?: number | null;
    height?: number | null;
    durationSeconds?: number | null;
  };

const ATTACHMENT_BUCKET = "attachments";

export class UploadAttachmentUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly issues: IssueRepository,
    private readonly comments: CommentRepository,
    private readonly attachments: AttachmentRepository,
    private readonly fileRepository: FileRepository,
    private readonly storage: FileStorage,
    private readonly transaction: TransactionManager,
  ) {}

  async execute(input: UploadAttachmentInput): Promise<AttachmentDto> {
    const media = AttachmentMedia.create(input.content);
    await requireProjectMember(this.projects, input.id, input.actorUserId);

    const issue = await this.issues.findById(input);

    if (!issue) {
      throw new IssueNotFoundError(input.issueId);
    }

    if (input.commentId !== null) {
      const comment = await this.comments.findById({
        id: input.id,
        issueId: input.issueId,
        commentId: input.commentId,
      });

      if (!comment) {
        throw new CommentNotFoundError(input.commentId);
      }

      comment.assertWrittenBy(input.actorUserId);
    }

    const max =
      input.commentId === null
        ? ATTACHMENTS_PER_ISSUE_MAX
        : ATTACHMENTS_PER_COMMENT_MAX;

    if ((await this.attachments.countByTarget(input)) >= max) {
      throw new TooManyAttachmentsError(max);
    }

    const storageKey = `${ATTACHMENT_BUCKET}/${input.issueId}/${randomUUID()}.${media.extension}`;
    await this.storage.save(storageKey, media.buffer);

    try {
      const attachmentId = await this.transaction.run(async () => {
        const fileId = await this.fileRepository.create({
          actorUserId: input.actorUserId,
          bucket: ATTACHMENT_BUCKET,
          storageKey,
          originalName: input.originalName,
          mimeType: media.mimeType,
          sizeBytes: media.sizeBytes,
          checksumSha256: media.checksumSha256,
          width: input.width,
          height: input.height,
          durationSeconds: input.durationSeconds,
        });

        return this.attachments.create({ ...input, fileId });
      });
      const created = await this.attachments.findDtoById({
        ...input,
        attachmentId,
      });

      if (!created) {
        throw new AttachmentNotFoundError(attachmentId);
      }

      return created;
    } catch (error) {
      await this.storage.delete(storageKey).catch(() => undefined);
      throw error;
    }
  }
}
