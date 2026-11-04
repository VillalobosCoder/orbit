import { AttachmentController } from "../attachment.controller.js";
import { DeleteAttachmentUseCase } from "../../../../application/attachment/use-cases/delete-attachment.use-case.js";
import { GetAttachmentContentUseCase } from "../../../../application/attachment/use-cases/get-attachment-content.use-case.js";
import { GetAttachmentsUseCase } from "../../../../application/attachment/use-cases/get-attachments.use-case.js";
import { UploadAttachmentUseCase } from "../../../../application/attachment/use-cases/upload-attachment.use-case.js";
import type { ControllerDependencies } from "../dependencies.js";

export function createAttachmentController(dependencies: ControllerDependencies) {
  return new AttachmentController(
    new GetAttachmentsUseCase(
      dependencies.projectRepository,
      dependencies.issueRepository,
      dependencies.attachmentRepository,
    ),
    new UploadAttachmentUseCase(
      dependencies.projectRepository,
      dependencies.issueRepository,
      dependencies.commentRepository,
      dependencies.attachmentRepository,
      dependencies.fileRepository,
      dependencies.fileStorage,
      dependencies.transaction,
    ),
    new GetAttachmentContentUseCase(
      dependencies.projectRepository,
      dependencies.attachmentRepository,
      dependencies.fileStorage,
    ),
    new DeleteAttachmentUseCase(
      dependencies.projectRepository,
      dependencies.commentRepository,
      dependencies.attachmentRepository,
      dependencies.fileRepository,
      dependencies.fileStorage,
      dependencies.transaction,
    ),
  );
}
