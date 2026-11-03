import type { MessageKey } from "@orbit/i18n";

import { toast } from "@/components/ui/toast";
import { t } from "@/i18n/locale-store";
import { getSuccessToastsEnabled } from "./notification-preference";

const SUCCESS_TIMEOUT_MS = 4000;
const ERROR_TIMEOUT_MS = 8000;

export function notifySuccess(message: MessageKey) {
  if (!getSuccessToastsEnabled()) return;

  toast.add({
    type: "success",
    title: t(message),
    timeout: SUCCESS_TIMEOUT_MS,
  });
}

const DUPLICATE_WINDOW_MS = 5000;
const recentErrors = new Map<string, number>();

export function notifyError(description: string) {
  const now = Date.now();
  const lastShown = recentErrors.get(description);

  if (lastShown !== undefined && now - lastShown < DUPLICATE_WINDOW_MS) return;

  recentErrors.set(description, now);

  toast.add({
    type: "error",
    title: t("toasts.errorTitle"),
    description,
    timeout: ERROR_TIMEOUT_MS,
  });
}
