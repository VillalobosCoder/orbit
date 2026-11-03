import type {
  AttachmentDto,
  AttachmentRequestDto,
  IssueRequestDto,
} from "@orbit/shared";
import type { Actor } from "../../shared/actor.js";

export type CreateAttachmentCommand = IssueRequestDto &
  Actor & { fileId: number };

export type AttachmentFile = {
  attachmentId: number;
  fileId: number;
  storageKey: string;
  mimeType: string;
  originalName: string;
};

export interface AttachmentRepository {
  create(command: CreateAttachmentCommand): Promise<number>;
  countByIssue(query: IssueRequestDto): Promise<number>;
  findAllByIssue(query: IssueRequestDto): Promise<AttachmentDto[]>;
  findDtoById(query: AttachmentRequestDto): Promise<AttachmentDto | null>;
  findFileById(query: AttachmentRequestDto): Promise<AttachmentFile | null>;
  delete(query: AttachmentRequestDto): Promise<void>;
}
