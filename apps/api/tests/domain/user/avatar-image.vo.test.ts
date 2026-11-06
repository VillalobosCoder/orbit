import { describe, expect, it } from "vitest";
import {
  AvatarTooLargeError,
  InvalidAvatarImageError,
} from "../../../src/domain/user/user.errors.js";
import { AvatarImage } from "../../../src/domain/user/value-objects/avatar-image.vo.js";
import { bytes, JPEG_HEADER, MP4_HEADER, PNG_HEADER } from "../../support/media.js";

describe("AvatarImage", () => {
  it("detects PNG and JPEG by their first bytes", () => {
    expect(AvatarImage.create(bytes(PNG_HEADER)).mimeType).toBe("image/png");
    expect(AvatarImage.create(bytes(JPEG_HEADER)).mimeType).toBe("image/jpeg");
  });

  it("detects WebP by its RIFF and WEBP markers", () => {
    const webp = Buffer.concat([
      Buffer.from("RIFF"),
      Buffer.alloc(4),
      Buffer.from("WEBP"),
      Buffer.alloc(8),
    ]);

    expect(AvatarImage.create(webp).mimeType).toBe("image/webp");
  });

  it("rejects text, video and empty content", () => {
    expect(() => AvatarImage.create(Buffer.from("hello"))).toThrow(InvalidAvatarImageError);
    expect(() => AvatarImage.create(bytes(MP4_HEADER))).toThrow(InvalidAvatarImageError);
    expect(() => AvatarImage.create(Buffer.alloc(0))).toThrow(InvalidAvatarImageError);
  });

  it("rejects images over 2 MB", () => {
    expect(() => AvatarImage.create(bytes(PNG_HEADER, 2 * 1024 * 1024 + 1))).toThrow(
      AvatarTooLargeError,
    );
  });

  it("exposes extension, size and a stable checksum", () => {
    const image = AvatarImage.create(bytes(PNG_HEADER, 64));

    expect(image.extension).toBe("png");
    expect(image.sizeBytes).toBe(64);
    expect(image.checksumSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(AvatarImage.create(bytes(PNG_HEADER, 64)).checksumSha256).toBe(image.checksumSha256);
  });
});
