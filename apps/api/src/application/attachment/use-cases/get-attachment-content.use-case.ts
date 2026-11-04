import type { AttachmentRequestDto } from "@orbit/shared";
import { AttachmentNotFoundError } from "../../../domain/attachment/attachment.errors.js";
import type { Readable } from "node:stream";
import type {
  FileRange,
  FileStorage,
} from "../../file/ports/file-storage.port.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { Actor } from "../../shared/actor.js";
import type { AttachmentRepository } from "../ports/attachment-repository.port.js";
import { requireProjectMember } from "../../project/utils/require-project-member.js";

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
    await requireProjectMember(this.projects, input.id, input.actorUserId);

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
