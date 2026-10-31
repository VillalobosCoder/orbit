import { createHash } from "node:crypto";
import { AVATAR_MAX_BYTES, type AvatarMimeType } from "@orbit/shared";
import {
  AvatarTooLargeError,
  InvalidAvatarImageError,
} from "../user.errors.js";

const EXTENSIONS: Record<AvatarMimeType, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

function startsWith(content: Buffer, signature: number[], offset = 0) {
  return signature.every((byte, index) => content[offset + index] === byte);
}

function detectMimeType(content: Buffer): AvatarMimeType | null {
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

  return null;
}

export class AvatarImage {
  private constructor(
    private readonly content: Buffer,
    private readonly detectedMimeType: AvatarMimeType,
  ) {}

  static create(content: Buffer): AvatarImage {
    if (content.byteLength > AVATAR_MAX_BYTES) {
      throw new AvatarTooLargeError();
    }

    const mimeType = detectMimeType(content);

    if (!mimeType) {
      throw new InvalidAvatarImageError();
    }

    return new AvatarImage(content, mimeType);
  }

  get buffer(): Buffer {
    return this.content;
  }

  get mimeType(): AvatarMimeType {
    return this.detectedMimeType;
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
