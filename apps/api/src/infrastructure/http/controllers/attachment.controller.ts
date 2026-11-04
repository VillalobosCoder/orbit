import type { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { NextFunction, Response } from "express";
import {
  ATTACHMENT_DIMENSION_MAX,
  ATTACHMENT_DURATION_MAX_SECONDS,
  type AttachmentDto,
  type AttachmentRequestDto,
  type IssueRequestDto,
} from "@orbit/shared";
import type { DeleteAttachmentUseCase } from "../../../application/attachment/use-cases/delete-attachment.use-case.js";
import type { GetAttachmentContentUseCase } from "../../../application/attachment/use-cases/get-attachment-content.use-case.js";
import type { GetAttachmentsUseCase } from "../../../application/attachment/use-cases/get-attachments.use-case.js";
import type { UploadAttachmentUseCase } from "../../../application/attachment/use-cases/upload-attachment.use-case.js";
import { InvalidAttachmentError } from "../../../domain/attachment/attachment.errors.js";
import type { AuthedRequest } from "../middleware/auth.middleware.js";
import {
  attachmentParamSchema,
  attachmentTargetSchema,
} from "../schemas/attachment.schema.js";
import { issueParamSchema } from "../schemas/issue.schema.js";

const FILE_NAME_HEADER = "x-file-name";
const WIDTH_HEADER = "x-media-width";
const HEIGHT_HEADER = "x-media-height";
const DURATION_HEADER = "x-media-duration";
const FILE_NAME_MAX_LENGTH = 255;
const DEFAULT_FILE_NAME = "archivo";

function readFileName(header: string | string[] | undefined): string {
  const raw = Array.isArray(header) ? header[0] : header;

  if (!raw) {
    return DEFAULT_FILE_NAME;
  }

  let decoded: string;

  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }

  const clean = Array.from(decoded, (char) => {
    const code = char.charCodeAt(0);
    return char === "/" || char === "\\" || code < 32 || code === 127
      ? "_"
      : char;
  })
    .join("")
    .trim()
    .slice(0, FILE_NAME_MAX_LENGTH);

  return clean || DEFAULT_FILE_NAME;
}

function readMeasure(
  header: string | string[] | undefined,
  max: number,
): number | null {
  const raw = Array.isArray(header) ? header[0] : header;
  const value = raw === undefined ? NaN : Math.round(Number(raw));

  return Number.isFinite(value) && value >= 0 && value <= max ? value : null;
}

async function sendStream(stream: Readable, res: Response): Promise<void> {
  try {
    await pipeline(stream, res);
  } catch {
    res.destroy();
  }
}

function parseRange(
  header: string | undefined,
  size: number,
): { start: number; end: number } | "full" | null {
  if (!header) {
    return "full";
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());

  if (!match || (match[1] === "" && match[2] === "")) {
    return "full";
  }

  let start: number;
  let end: number;

  if (match[1] === "") {
    const suffix = Number(match[2]);
    start = Math.max(size - suffix, 0);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === "" ? size - 1 : Math.min(Number(match[2]), size - 1);
  }

  if (start >= size || start > end) {
    return null;
  }

  return { start, end };
}

export class AttachmentController {
  constructor(
    private readonly getAttachmentsUseCase: GetAttachmentsUseCase,
    private readonly uploadAttachmentUseCase: UploadAttachmentUseCase,
    private readonly getAttachmentContentUseCase: GetAttachmentContentUseCase,
    private readonly deleteAttachmentUseCase: DeleteAttachmentUseCase,
  ) {}

  getAll = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id, issueId }: IssueRequestDto = issueParamSchema.parse(
        req.params,
      );
      const response: AttachmentDto[] =
        await this.getAttachmentsUseCase.execute({
          id,
          issueId,
          actorUserId: req.auth!.id,
        });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  upload = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id, issueId, commentId } = attachmentTargetSchema.parse(
        req.params,
      );

      if (!Buffer.isBuffer(req.body)) {
        throw new InvalidAttachmentError();
      }

      const response: AttachmentDto =
        await this.uploadAttachmentUseCase.execute({
          id,
          issueId,
          commentId: commentId ?? null,
          actorUserId: req.auth!.id,
          content: req.body,
          originalName: readFileName(req.headers[FILE_NAME_HEADER]),
          width: readMeasure(req.headers[WIDTH_HEADER], ATTACHMENT_DIMENSION_MAX),
          height: readMeasure(req.headers[HEIGHT_HEADER], ATTACHMENT_DIMENSION_MAX),
          durationSeconds: readMeasure(
            req.headers[DURATION_HEADER],
            ATTACHMENT_DURATION_MAX_SECONDS,
          ),
        });
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  getContent = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id, issueId, attachmentId }: AttachmentRequestDto =
        attachmentParamSchema.parse(req.params);
      const { size, mimeType, open } =
        await this.getAttachmentContentUseCase.execute({
          id,
          issueId,
          attachmentId,
          actorUserId: req.auth!.id,
        });
      const range = parseRange(req.headers.range, size);

      res.set({
        "Cache-Control": "private, max-age=86400",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "sandbox",
        "Accept-Ranges": "bytes",
        "Content-Type": mimeType,
      });

      if (range === null) {
        res.status(416).set("Content-Range", `bytes */${size}`);
        res.end();
        return;
      }

      if (range === "full") {
        res.status(200).set("Content-Length", String(size));
        await sendStream(open(), res);
        return;
      }

      res
        .status(206)
        .set({
          "Content-Range": `bytes ${range.start}-${range.end}/${size}`,
          "Content-Length": String(range.end - range.start + 1),
        });
      await sendStream(open(range), res);
    } catch (error) {
      next(error);
    }
  };

  delete = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id, issueId, commentId, attachmentId } =
        attachmentParamSchema.parse(req.params);
      await this.deleteAttachmentUseCase.execute({
        id,
        issueId,
        attachmentId,
        commentId: commentId ?? null,
        actorUserId: req.auth!.id,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
