import { randomUUID } from "node:crypto";
import {
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
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";
import type { FileRepository } from "../../file/ports/file-repository.port.js";
import type { FileStorage } from "../../file/ports/file-storage.port.js";
import type { IssueRepository } from "../../issue/ports/issue-repository.port.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { Actor } from "../../shared/actor.js";
import type { TransactionManager } from "../../shared/ports/transaction-manager.port.js";
import type { AttachmentRepository } from "../ports/attachment-repository.port.js";

export type UploadAttachmentInput = IssueRequestDto &
  Actor & { content: Buffer; originalName: string };

const ATTACHMENT_BUCKET = "attachments";

export class UploadAttachmentUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly issues: IssueRepository,
    private readonly attachments: AttachmentRepository,
    private readonly fileRepository: FileRepository,
    private readonly storage: FileStorage,
    private readonly transaction: TransactionManager,
  ) {}

  async execute(input: UploadAttachmentInput): Promise<AttachmentDto> {
    const media = AttachmentMedia.create(input.content);
    const project = await this.projects.findByIdForMember({
      id: input.id,
      userId: input.actorUserId,
    });

    if (!project) {
      throw new ProjectNotFoundError(input.id);
    }

    const issue = await this.issues.findById(input);

    if (!issue) {
      throw new IssueNotFoundError(input.issueId);
    }

    if ((await this.attachments.countByIssue(input)) >= ATTACHMENTS_PER_ISSUE_MAX) {
      throw new TooManyAttachmentsError(ATTACHMENTS_PER_ISSUE_MAX);
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
