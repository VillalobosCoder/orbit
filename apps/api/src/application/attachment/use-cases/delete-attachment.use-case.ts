import type { AttachmentRequestDto } from "@orbit/shared";
import { AttachmentNotFoundError } from "../../../domain/attachment/attachment.errors.js";
import { CommentNotFoundError } from "../../../domain/comment/comment.errors.js";
import type { CommentRepository } from "../../comment/ports/comment-repository.port.js";
import type { FileRepository } from "../../file/ports/file-repository.port.js";
import type { FileStorage } from "../../file/ports/file-storage.port.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { Actor } from "../../shared/actor.js";
import type { TransactionManager } from "../../shared/ports/transaction-manager.port.js";
import type { AttachmentRepository } from "../ports/attachment-repository.port.js";
import { requireProjectMember } from "../../project/utils/require-project-member.js";

export type DeleteAttachmentInput = AttachmentRequestDto & {
  commentId: number | null;
} & Actor;

export class DeleteAttachmentUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly comments: CommentRepository,
    private readonly attachments: AttachmentRepository,
    private readonly fileRepository: FileRepository,
    private readonly storage: FileStorage,
    private readonly transaction: TransactionManager,
  ) {}

  async execute(input: DeleteAttachmentInput): Promise<void> {
    await requireProjectMember(this.projects, input.id, input.actorUserId);

    const file = await this.attachments.findFileById(input);

    if (!file) {
      throw new AttachmentNotFoundError(input.attachmentId);
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

    await this.transaction.run(async () => {
      await this.attachments.delete(input);
      await this.fileRepository.delete({ id: file.fileId });
    });
    await this.storage.delete(file.storageKey).catch(() => undefined);
  }
}
