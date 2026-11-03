import type {
  AttachmentDto,
  AttachmentRequestDto,
  IssueRequestDto,
} from "@orbit/shared";
import type { Actor } from "../../shared/actor.js";

export type AttachmentTarget = IssueRequestDto & {
  commentId: number | null;
};

export type CreateAttachmentCommand = AttachmentTarget &
  Actor & { fileId: number };

export type AttachmentFile = {
  attachmentId: number;
  fileId: number;
  storageKey: string;
  mimeType: string;
  originalName: string;
  commentId: number | null;
};

export interface AttachmentRepository {
  create(command: CreateAttachmentCommand): Promise<number>;
  countByTarget(query: AttachmentTarget): Promise<number>;
  findAllByIssue(query: IssueRequestDto): Promise<AttachmentDto[]>;
  findDtoById(query: AttachmentRequestDto): Promise<AttachmentDto | null>;
  findFileById(query: AttachmentRequestDto): Promise<AttachmentFile | null>;
  findFilesByComment(query: Required<AttachmentTarget> & { commentId: number }): Promise<AttachmentFile[]>;
  delete(query: AttachmentRequestDto): Promise<void>;
  deleteByComment(query: { commentId: number }): Promise<void>;
}
