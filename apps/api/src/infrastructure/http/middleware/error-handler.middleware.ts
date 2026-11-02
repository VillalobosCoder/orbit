import type { Request, Response, NextFunction } from "express";
import { isMessageKey, translate } from "@orbit/i18n";
import { ZodError } from "zod";
import { DomainError } from "../../../domain/shared/domain-error.js";
import { localeOf, sendError } from "./locale.middleware.js";

function getParserErrorType(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    typeof error.type === "string"
  ) {
    return error.type;
  }

  return undefined;
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (res.headersSent) {
    return _next(err);
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: translate(localeOf(res), "errors.http.invalidData"),
      details: err.issues.map((issue) => ({
        ...issue,
        message: isMessageKey(issue.message)
          ? translate(localeOf(res), issue.message)
          : issue.message,
      })),
    });
  }

  if (err instanceof DomainError) {
    return res.status(err.statusCode).json({
      error: translate(localeOf(res), err.messageKey, err.params),
    });
  }

  const parserErrorType = getParserErrorType(err);
  if (parserErrorType === "entity.parse.failed") {
    return sendError(res, 400, "errors.http.invalidJson");
  }

  if (parserErrorType === "entity.too.large") {
    return sendError(res, 413, "errors.http.bodyTooLarge");
  }

  if (
    parserErrorType === "encoding.unsupported" ||
    parserErrorType === "charset.unsupported"
  ) {
    return sendError(res, 415, "errors.http.unsupportedFormat");
  }

  sendError(res, 500, "errors.http.internal");
}
