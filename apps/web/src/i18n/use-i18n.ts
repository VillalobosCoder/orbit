import { useMemo, useSyncExternalStore } from "react";
import { createTranslator } from "@orbit/i18n";

import { getLocale, setLocale, subscribeLocale } from "./locale-store";

export function useI18n() {
  const locale = useSyncExternalStore(subscribeLocale, getLocale, getLocale);
  const t = useMemo(() => createTranslator(locale), [locale]);

  return { locale, setLocale, t };
}
