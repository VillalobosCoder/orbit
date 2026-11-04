import { CommentController } from "../comment.controller.js";
import { CreateCommentUseCase } from "../../../../application/comment/use-cases/create-comment.use-case.js";
import { DeleteCommentUseCase } from "../../../../application/comment/use-cases/delete-comment.use-case.js";
import { GetCommentsUseCase } from "../../../../application/comment/use-cases/get-comments.use-case.js";
import { UpdateCommentUseCase } from "../../../../application/comment/use-cases/update-comment.use-case.js";
import type { ControllerDependencies } from "../dependencies.js";

export function createCommentController(dependencies: ControllerDependencies) {
  return new CommentController(
    new GetCommentsUseCase(
      dependencies.projectRepository,
      dependencies.issueRepository,
      dependencies.commentRepository,
    ),
    new CreateCommentUseCase(
      dependencies.projectRepository,
      dependencies.issueRepository,
      dependencies.commentRepository,
      dependencies.notificationRepository,
    ),
    new UpdateCommentUseCase(
      dependencies.projectRepository,
      dependencies.commentRepository,
    ),
    new DeleteCommentUseCase(
      dependencies.projectRepository,
      dependencies.commentRepository,
      dependencies.attachmentRepository,
      dependencies.fileRepository,
      dependencies.fileStorage,
      dependencies.transaction,
    ),
  );
}
