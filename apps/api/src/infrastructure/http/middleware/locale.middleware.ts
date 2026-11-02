import type { RequestHandler, Response } from "express";
import {
  DEFAULT_LOCALE,
  isLocale,
  resolveLocale,
  translate,
  type Locale,
  type MessageKey,
  type MessageVariables,
} from "@orbit/i18n";

export function makeLocaleMiddleware(): RequestHandler {
  return (req, res, next) => {
    res.locals.locale = resolveLocale(req.header("accept-language"));
    next();
  };
}

export function localeOf(res: Response): Locale {
  const locale: unknown = res.locals.locale;

  return isLocale(locale) ? locale : DEFAULT_LOCALE;
}

export function sendError(
  res: Response,
  status: number,
  key: MessageKey,
  params?: MessageVariables,
): void {
  res.status(status).json({ error: translate(localeOf(res), key, params) });
}
