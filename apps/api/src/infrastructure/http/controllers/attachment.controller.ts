import type { NextFunction, Response } from "express";
import type {
  AttachmentDto,
  AttachmentRequestDto,
  IssueRequestDto,
} from "@orbit/shared";
import type { DeleteAttachmentUseCase } from "../../../application/attachment/use-cases/delete-attachment.use-case.js";
import type { GetAttachmentContentUseCase } from "../../../application/attachment/use-cases/get-attachment-content.use-case.js";
import type { GetAttachmentsUseCase } from "../../../application/attachment/use-cases/get-attachments.use-case.js";
import type { UploadAttachmentUseCase } from "../../../application/attachment/use-cases/upload-attachment.use-case.js";
import { InvalidAttachmentError } from "../../../domain/attachment/attachment.errors.js";
import type { AuthedRequest } from "../middleware/auth.middleware.js";
import { attachmentParamSchema } from "../schemas/attachment.schema.js";
import { issueParamSchema } from "../schemas/issue.schema.js";

const FILE_NAME_HEADER = "x-file-name";
const FILE_NAME_MAX_LENGTH = 255;
const DEFAULT_FILE_NAME = "archivo";

function readFileName(header: string | string[] | undefined): string {
  const raw = Array.isArray(header) ? header[0] : header;

  if (!raw) {
    return DEFAULT_FILE_NAME;
  }

  let decoded = raw;

  decoded = decodeURIComponent(raw);

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
      const { id, issueId }: IssueRequestDto = issueParamSchema.parse(
        req.params,
      );

      if (!Buffer.isBuffer(req.body)) {
        throw new InvalidAttachmentError();
      }

      const response: AttachmentDto =
        await this.uploadAttachmentUseCase.execute({
          id,
          issueId,
          actorUserId: req.auth!.id,
          content: req.body,
          originalName: readFileName(req.headers[FILE_NAME_HEADER]),
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
      const { content, mimeType } =
        await this.getAttachmentContentUseCase.execute({
          id,
          issueId,
          attachmentId,
          actorUserId: req.auth!.id,
        });
      const range = parseRange(req.headers.range, content.byteLength);

      res.set({
        "Cache-Control": "private, max-age=86400",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "sandbox",
        "Accept-Ranges": "bytes",
        "Content-Type": mimeType,
      });

      if (range === null) {
        res.status(416).set("Content-Range", `bytes */${content.byteLength}`);
        res.end();
        return;
      }

      if (range === "full") {
        res.status(200).send(content);
        return;
      }

      res
        .status(206)
        .set(
          "Content-Range",
          `bytes ${range.start}-${range.end}/${content.byteLength}`,
        )
        .send(content.subarray(range.start, range.end + 1));
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
      const { id, issueId, attachmentId }: AttachmentRequestDto =
        attachmentParamSchema.parse(req.params);
      await this.deleteAttachmentUseCase.execute({
        id,
        issueId,
        attachmentId,
        actorUserId: req.auth!.id,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
