import { en } from "./locales/en/index.js";
import { es } from "./locales/es/index.js";
import {
  DEFAULT_LOCALE,
  isLocale,
  type Locale,
  type MessagePath,
  type MessageTree,
  type MessageValue,
  type MessageVariables,
} from "./types.js";

export type Messages = typeof es;

export type MessageKey = MessagePath<Messages>;

export const dictionaries: Record<Locale, Messages> = { es, en };

function findMessage(tree: MessageTree, key: string): MessageValue | undefined {
  let current: MessageTree | MessageValue | undefined = tree;

  for (const part of key.split(".")) {
    if (typeof current !== "object" || current === null || "one" in current) {
      return undefined;
    }

    current = (current as MessageTree)[part];
  }

  return current as MessageValue | undefined;
}

function interpolate(template: string, variables?: MessageVariables) {
  if (!variables) return template;

  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in variables ? String(variables[name]) : placeholder,
  );
}

export function isMessageKey(value: string): value is MessageKey {
  return findMessage(dictionaries[DEFAULT_LOCALE], value) !== undefined;
}

export function translate(
  locale: Locale,
  key: MessageKey,
  variables?: MessageVariables,
): string {
  const value =
    findMessage(dictionaries[locale], key) ??
    findMessage(dictionaries[DEFAULT_LOCALE], key);

  if (value === undefined) return key;

  if (typeof value === "string") return interpolate(value, variables);

  return interpolate(
    variables?.count === 1 ? value.one : value.other,
    variables,
  );
}

export type Translator = (key: MessageKey, variables?: MessageVariables) => string;

export function createTranslator(locale: Locale): Translator {
  return (key, variables) => translate(locale, key, variables);
}

export function resolveLocale(header: string | undefined | null): Locale {
  if (!header) return DEFAULT_LOCALE;

  const candidates = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const quality = params
        .map((param) => param.trim())
        .find((param) => param.startsWith("q="));

      return {
        language: tag.trim().toLowerCase().split("-")[0],
        quality: quality ? Number(quality.slice(2)) : 1,
      };
    })
    .filter((candidate) => candidate.language && !Number.isNaN(candidate.quality))
    .sort((a, b) => b.quality - a.quality);

  return (
    candidates.map((candidate) => candidate.language).find(isLocale) ??
    DEFAULT_LOCALE
  );
}
