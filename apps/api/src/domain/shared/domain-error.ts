import {
  DEFAULT_LOCALE,
  translate,
  type MessageKey,
  type MessageVariables,
} from "@orbit/i18n";

export abstract class DomainError extends Error {
  abstract readonly statusCode: number;

  constructor(
    readonly messageKey: MessageKey,
    readonly params?: MessageVariables,
  ) {
    super(translate(DEFAULT_LOCALE, messageKey, params));
    this.name = new.target.name;
  }
}
