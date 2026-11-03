import type { CommentRequestDto } from "@orbit/shared";
import { CommentNotFoundError } from "../../../domain/comment/comment.errors.js";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";
import type { AttachmentRepository } from "../../attachment/ports/attachment-repository.port.js";
import type { FileRepository } from "../../file/ports/file-repository.port.js";
import type { FileStorage } from "../../file/ports/file-storage.port.js";
import type { TransactionManager } from "../../shared/ports/transaction-manager.port.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { CommentRepository } from "../ports/comment-repository.port.js";
import type { Actor } from "../../shared/actor.js";

export type DeleteCommentInput = CommentRequestDto & Actor;

export class DeleteCommentUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly comments: CommentRepository,
    private readonly attachments: AttachmentRepository,
    private readonly fileRepository: FileRepository,
    private readonly storage: FileStorage,
    private readonly transaction: TransactionManager,
  ) {}

  async execute(input: DeleteCommentInput): Promise<void> {
    const project = await this.projects.findByIdForMember({
      id: input.id,
      userId: input.actorUserId,
    });

    if (!project) {
      throw new ProjectNotFoundError(input.id);
    }

    const comment = await this.comments.findById(input);

    if (!comment) {
      throw new CommentNotFoundError(input.commentId);
    }

    comment.assertWrittenBy(input.actorUserId);

    const files = await this.attachments.findFilesByComment({
      id: input.id,
      issueId: input.issueId,
      commentId: input.commentId,
    });

    await this.transaction.run(async () => {
      await this.attachments.deleteByComment({ commentId: input.commentId });

      for (const file of files) {
        await this.fileRepository.delete({ id: file.fileId });
      }

      await this.comments.delete(input);
    });
    await Promise.all(
      files.map((file) =>
        this.storage.delete(file.storageKey).catch(() => undefined),
      ),
    );
  }
}
