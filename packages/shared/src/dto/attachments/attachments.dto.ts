import type { IssueRequestDto } from "../issues/issues.dto.js";

export type AttachmentKind = "image" | "video";

export type AttachmentDto = {
  id: number;
  issueId: number;
  commentId: number | null;
  kind: AttachmentKind;
  mimeType: string;
  originalName: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  uploadedByName: string;
  createdAt: string;
};

export type AttachmentRequestDto = IssueRequestDto & {
  attachmentId: number;
  commentId?: number | null;
};
