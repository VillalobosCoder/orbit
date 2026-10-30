import type { CommentRequestDto } from "@orbit/shared";
import { CommentNotFoundError } from "../../../domain/comment/comment.errors.js";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { CommentRepository } from "../ports/comment-repository.port.js";
import type { Actor } from "../../shared/actor.js";

export type DeleteCommentInput = CommentRequestDto & Actor;

export class DeleteCommentUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly comments: CommentRepository,
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

    await this.comments.delete(input);
  }
}
