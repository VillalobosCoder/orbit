import {
  DEFAULT_LOCALE,
  isLocale,
  resolveLocale,
  translate,
  type Locale,
  type MessageKey,
  type MessageVariables,
} from "@orbit/i18n";

const STORAGE_KEY = "orbit-locale";

function readInitialLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (isLocale(stored)) return stored;
  } catch {
    // Sin acceso al almacenamiento: se usa el idioma del navegador.
  }

  return resolveLocale(window.navigator.languages?.join(",")) ?? DEFAULT_LOCALE;
}

let currentLocale: Locale = readInitialLocale();
const listeners = new Set<() => void>();

document.documentElement.lang = currentLocale;

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale) {
  if (locale === currentLocale) return;

  currentLocale = locale;
  document.documentElement.lang = locale;

  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // La preferencia solo vive en memoria si el almacenamiento falla.
  }

  listeners.forEach((listener) => listener());
}

export function subscribeLocale(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/** Traduce fuera de React, con el idioma activo en este momento. */
export function t(key: MessageKey, variables?: MessageVariables): string {
  return translate(currentLocale, key, variables);
}
