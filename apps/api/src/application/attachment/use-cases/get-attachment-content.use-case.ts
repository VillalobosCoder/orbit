import type { AttachmentRequestDto } from "@orbit/shared";
import { AttachmentNotFoundError } from "../../../domain/attachment/attachment.errors.js";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";
import type { Readable } from "node:stream";
import type {
  FileRange,
  FileStorage,
} from "../../file/ports/file-storage.port.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { Actor } from "../../shared/actor.js";
import type { AttachmentRepository } from "../ports/attachment-repository.port.js";

export type GetAttachmentContentInput = AttachmentRequestDto & Actor;

export type AttachmentContent = {
  size: number;
  mimeType: string;
  originalName: string;
  open: (range?: FileRange) => Readable;
};

export class GetAttachmentContentUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly attachments: AttachmentRepository,
    private readonly storage: FileStorage,
  ) {}

  async execute(input: GetAttachmentContentInput): Promise<AttachmentContent> {
    const project = await this.projects.findByIdForMember({
      id: input.id,
      userId: input.actorUserId,
    });

    if (!project) {
      throw new ProjectNotFoundError(input.id);
    }

    const file = await this.attachments.findFileById(input);
    const size = file ? await this.storage.size(file.storageKey) : null;

    if (!file || size === null) {
      throw new AttachmentNotFoundError(input.attachmentId);
    }

    return {
      size,
      mimeType: file.mimeType,
      originalName: file.originalName,
      open: (range) => this.storage.openRead(file.storageKey, range),
    };
  }
}
