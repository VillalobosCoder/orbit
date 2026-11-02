export const LOCALES = ["es", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "es";

export type PluralMessage = { one: string; other: string };

export type MessageValue = string | PluralMessage;

export type MessageTree = { [key: string]: MessageValue | MessageTree };

export type MessageVariables = Record<string, string | number>;

type Join<Prefix extends string, Rest extends string> = `${Prefix}.${Rest}`;

export type MessagePath<Tree> = {
  [Key in keyof Tree & string]: Tree[Key] extends MessageValue
    ? Key
    : Tree[Key] extends object
      ? Join<Key, MessagePath<Tree[Key]>>
      : never;
}[keyof Tree & string];

export function isLocale(value: unknown): value is Locale {
  return LOCALES.some((locale) => locale === value);
}
