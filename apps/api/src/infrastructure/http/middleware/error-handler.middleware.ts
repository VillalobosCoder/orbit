import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { DomainError } from "../../../domain/shared/domain-error.js";

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

  res.status(500).json({ error: "Error interno del servidor." });
}
