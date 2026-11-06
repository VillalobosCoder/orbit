import { Readable } from "node:stream";
import { afterEach, describe, expect, it } from "vitest";
import type { DeleteAttachmentUseCase } from "../../../src/application/attachment/use-cases/delete-attachment.use-case.js";
import type { GetAttachmentsUseCase } from "../../../src/application/attachment/use-cases/get-attachments.use-case.js";
import type { UploadAttachmentUseCase } from "../../../src/application/attachment/use-cases/upload-attachment.use-case.js";
import type { GetAttachmentContentUseCase } from "../../../src/application/attachment/use-cases/get-attachment-content.use-case.js";
import { AttachmentNotFoundError } from "../../../src/domain/attachment/attachment.errors.js";
import { AttachmentController } from "../../../src/infrastructure/http/controllers/attachment.controller.js";
import { startApp, stopApps } from "../../support/http.js";
import { stub } from "../../support/stub.js";

afterEach(stopApps);

const CONTENT = Buffer.from("0123456789abcdefghij");

async function setup(found = true) {
  const content = stub<GetAttachmentContentUseCase>({
    execute: async () => {
      if (!found) {
        throw new AttachmentNotFoundError(1);
      }

      return {
        size: CONTENT.length,
        mimeType: "video/mp4",
        originalName: "clip.mp4",
        open: (range) =>
          Readable.from([range ? CONTENT.subarray(range.start, range.end + 1) : CONTENT]),
      };
    },
  });
  const unused = <T extends object>() => stub<T>({}) as unknown as T;
  const controller = new AttachmentController(
    unused<GetAttachmentsUseCase>(),
    unused<UploadAttachmentUseCase>(),
    content as unknown as GetAttachmentContentUseCase,
    unused<DeleteAttachmentUseCase>(),
  );
  const { url } = await startApp((app) => {
    app.get(
      "/projects/:id/issues/:issueId/attachments/:attachmentId",
      (req, _res, next) => {
        (req as unknown as { auth: object }).auth = { id: 3, mustChangePassword: false };
        next();
      },
      controller.getContent,
    );
  });

  return { url: `${url}/projects/10/issues/100/attachments/1`, content };
}

describe("attachment content endpoint", () => {
  it("sends the whole file with safe headers", async () => {
    const { url } = await setup();

    const response = await fetch(url);

    expect(response.status).toBe(200);
    expect(Buffer.from(await response.arrayBuffer())).toEqual(CONTENT);
    expect(response.headers.get("content-type")).toBe("video/mp4");
    expect(response.headers.get("content-length")).toBe(String(CONTENT.length));
    expect(response.headers.get("accept-ranges")).toBe("bytes");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("content-security-policy")).toBe("sandbox");
    expect(response.headers.get("cache-control")).toBe("private, max-age=86400");
  });

  it("asks for the attachment as the authenticated user", async () => {
    const { url, content } = await setup();

    await fetch(url);

    expect(content.execute).toHaveBeenCalledWith({
      id: 10,
      issueId: 100,
      attachmentId: 1,
      actorUserId: 3,
    });
  });

  it("serves a byte range with 206", async () => {
    const { url } = await setup();

    const response = await fetch(url, { headers: { range: "bytes=2-5" } });

    expect(response.status).toBe(206);
    expect(response.headers.get("content-range")).toBe("bytes 2-5/20");
    expect(response.headers.get("content-length")).toBe("4");
    expect(Buffer.from(await response.arrayBuffer()).toString()).toBe("2345");
  });

  it("serves an open-ended range", async () => {
    const { url } = await setup();

    const response = await fetch(url, { headers: { range: "bytes=15-" } });

    expect(response.status).toBe(206);
    expect(Buffer.from(await response.arrayBuffer()).toString()).toBe("fghij");
  });

  it("serves the last bytes for a suffix range", async () => {
    const { url } = await setup();

    const response = await fetch(url, { headers: { range: "bytes=-3" } });

    expect(response.status).toBe(206);
    expect(response.headers.get("content-range")).toBe("bytes 17-19/20");
    expect(Buffer.from(await response.arrayBuffer()).toString()).toBe("hij");
  });

  it("clamps a range that ends past the file", async () => {
    const { url } = await setup();

    const response = await fetch(url, { headers: { range: "bytes=18-500" } });

    expect(response.status).toBe(206);
    expect(response.headers.get("content-range")).toBe("bytes 18-19/20");
  });

  it("answers 416 to a range that starts past the end", async () => {
    const { url } = await setup();

    const response = await fetch(url, { headers: { range: "bytes=500-" } });

    expect(response.status).toBe(416);
    expect(response.headers.get("content-range")).toBe("bytes */20");
  });

  it("ignores a malformed Range header and sends the whole file", async () => {
    const { url } = await setup();

    const response = await fetch(url, { headers: { range: "lines=1-2" } });

    expect(response.status).toBe(200);
  });

  it("answers 404 when the attachment does not exist", async () => {
    const { url } = await setup(false);

    const response = await fetch(url);

    expect(response.status).toBe(404);
  });
});
