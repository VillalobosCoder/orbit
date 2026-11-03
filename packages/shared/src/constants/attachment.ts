export const ATTACHMENT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const ATTACHMENT_VIDEO_MAX_BYTES = 25 * 1024 * 1024;
export const ATTACHMENTS_PER_ISSUE_MAX = 10;
export const ATTACHMENTS_PER_COMMENT_MAX = 4;
export const ATTACHMENT_DIMENSION_MAX = 20_000;
export const ATTACHMENT_DURATION_MAX_SECONDS = 24 * 60 * 60;

export const ATTACHMENT_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

export const ATTACHMENT_VIDEO_MIME_TYPES = ["video/mp4", "video/webm"] as const;

export const ATTACHMENT_MIME_TYPES = [
  ...ATTACHMENT_IMAGE_MIME_TYPES,
  ...ATTACHMENT_VIDEO_MIME_TYPES,
] as const;

export type AttachmentMimeType = (typeof ATTACHMENT_MIME_TYPES)[number];
