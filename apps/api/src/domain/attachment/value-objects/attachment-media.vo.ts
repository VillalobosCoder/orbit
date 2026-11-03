import { createHash } from "node:crypto";
import {
  ATTACHMENT_IMAGE_MAX_BYTES,
  ATTACHMENT_VIDEO_MAX_BYTES,
  type AttachmentKind,
  type AttachmentMimeType,
} from "@orbit/shared";
import {
  AttachmentTooLargeError,
  InvalidAttachmentError,
} from "../attachment.errors.js";

const EXTENSIONS: Record<AttachmentMimeType, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

function startsWith(content: Buffer, signature: number[], offset = 0) {
  return signature.every((byte, index) => content[offset + index] === byte);
}

function detectMimeType(content: Buffer): AttachmentMimeType | null {
  if (startsWith(content, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }

  if (startsWith(content, [0xff, 0xd8, 0xff])) {
    return "image/jpeg";
  }

  if (
    startsWith(content, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(content, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return "image/webp";
  }

  if (startsWith(content, [0x47, 0x49, 0x46, 0x38])) {
    return "image/gif";
  }

  if (startsWith(content, [0x66, 0x74, 0x79, 0x70], 4)) {
    return "video/mp4";
  }

  if (startsWith(content, [0x1a, 0x45, 0xdf, 0xa3])) {
    return "video/webm";
  }

  return null;
}

/** Imagen o video validado por sus primeros bytes, nunca por lo que declare el cliente. */
export class AttachmentMedia {
  private constructor(
    private readonly content: Buffer,
    private readonly detectedMimeType: AttachmentMimeType,
  ) {}

  static create(content: Buffer): AttachmentMedia {
    const mimeType = detectMimeType(content);

    if (!mimeType) {
      throw new InvalidAttachmentError();
    }

    const maxBytes = mimeType.startsWith("video/")
      ? ATTACHMENT_VIDEO_MAX_BYTES
      : ATTACHMENT_IMAGE_MAX_BYTES;

    if (content.byteLength > maxBytes) {
      throw new AttachmentTooLargeError(maxBytes / (1024 * 1024));
    }

    return new AttachmentMedia(content, mimeType);
  }

  get buffer(): Buffer {
    return this.content;
  }

  get mimeType(): AttachmentMimeType {
    return this.detectedMimeType;
  }

  get kind(): AttachmentKind {
    return this.detectedMimeType.startsWith("video/") ? "video" : "image";
  }

  get extension(): string {
    return EXTENSIONS[this.detectedMimeType];
  }

  get sizeBytes(): number {
    return this.content.byteLength;
  }

  get checksumSha256(): string {
    return createHash("sha256").update(this.content).digest("hex");
  }
}
