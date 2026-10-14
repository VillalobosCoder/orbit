import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { DomainError } from "../../../domain/shared/domain-error.js";

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
    return res
      .status(400)
      .json({ error: "Datos invalidos", details: err.issues });
  }

  if (err instanceof DomainError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  const parserErrorType = getParserErrorType(err);
  if (parserErrorType === "entity.parse.failed") {
    return res.status(400).json({ error: "El cuerpo JSON no es válido." });
  }

  if (parserErrorType === "entity.too.large") {
    return res
      .status(413)
      .json({ error: "El cuerpo de la solicitud es demasiado grande." });
  }

  if (
    parserErrorType === "encoding.unsupported" ||
    parserErrorType === "charset.unsupported"
  ) {
    return res
      .status(415)
      .json({ error: "Formato de solicitud no compatible." });
  }

  res.status(500).json({ error: "Error interno del servidor." });
}
