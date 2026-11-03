import type { IssueRequestDto } from "../issues/issues.dto.js";

export type AttachmentKind = "image" | "video";

export type AttachmentDto = {
  id: number;
  issueId: number;
  kind: AttachmentKind;
  mimeType: string;
  originalName: string;
  sizeBytes: number;
  uploadedByName: string;
  createdAt: string;
};

export type AttachmentRequestDto = IssueRequestDto & {
  attachmentId: number;
};
