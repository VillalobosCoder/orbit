import { describe, expect, it } from "vitest";
import {
  AttachmentTooLargeError,
  InvalidAttachmentError,
} from "../../../src/domain/attachment/attachment.errors.js";
import { AttachmentMedia } from "../../../src/domain/attachment/value-objects/attachment-media.vo.js";
import { bytes, JPEG_HEADER, MP4_HEADER, PNG_HEADER } from "../../support/media.js";

const MB = 1024 * 1024;

describe("AttachmentMedia", () => {
  it("accepts images and tells them from videos", () => {
    const png = AttachmentMedia.create(bytes(PNG_HEADER));
    const jpeg = AttachmentMedia.create(bytes(JPEG_HEADER));
    const mp4 = AttachmentMedia.create(bytes(MP4_HEADER));

    expect([png.mimeType, png.kind]).toEqual(["image/png", "image"]);
    expect([jpeg.mimeType, jpeg.extension]).toEqual(["image/jpeg", "jpg"]);
    expect([mp4.mimeType, mp4.kind, mp4.extension]).toEqual(["video/mp4", "video", "mp4"]);
  });

  it("detects GIF and WebM", () => {
    expect(AttachmentMedia.create(Buffer.from("GIF89a-----")).mimeType).toBe("image/gif");
    expect(
      AttachmentMedia.create(bytes([0x1a, 0x45, 0xdf, 0xa3])).mimeType,
    ).toBe("video/webm");
  });

  it("rejects anything else, even if it claims to be media", () => {
    expect(() => AttachmentMedia.create(Buffer.from("<svg onload=alert(1)>"))).toThrow(
      InvalidAttachmentError,
    );
    expect(() => AttachmentMedia.create(Buffer.from("MZ executable"))).toThrow(
      InvalidAttachmentError,
    );
  });

  it("allows images up to 5 MB and rejects larger ones", () => {
    expect(() => AttachmentMedia.create(bytes(PNG_HEADER, 5 * MB))).not.toThrow();
    expect(() => AttachmentMedia.create(bytes(PNG_HEADER, 5 * MB + 1))).toThrow(
      AttachmentTooLargeError,
    );
  });

  it("allows videos up to 25 MB and rejects larger ones", () => {
    expect(() => AttachmentMedia.create(bytes(MP4_HEADER, 25 * MB))).not.toThrow();
    expect(() => AttachmentMedia.create(bytes(MP4_HEADER, 25 * MB + 1))).toThrow(
      AttachmentTooLargeError,
    );
  });
});
