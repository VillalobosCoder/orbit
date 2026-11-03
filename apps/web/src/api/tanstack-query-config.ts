import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import type { MessageKey } from "@orbit/i18n";

import { ApiRequestError } from "@/api/config";
import { authSessionQueryKey } from "@/features/auth/api/auth.api";
import { notifyError, notifySuccess } from "@/notifications/notify";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      successMessage?: MessageKey;
    };
  }
}

export const POLL_INTERVAL_MS = 15_000;

export const DEBOUNCE_MS = 1_000;

function shouldRetry(failureCount: number, error: unknown) {
  const status = typeof error === "object" && error !== null && "status" in error
    ? Number(error.status)
    : undefined;

  if (status !== undefined && [400, 401, 403, 404].includes(status)) {
    return false;
  }

  return failureCount < 2;
}

function handleSessionExpired(error: unknown) {
  if (!(error instanceof ApiRequestError) || error.status !== 401) return false;
  if (!queryClient.getQueryData(authSessionQueryKey)) return false;

  queryClient.clear();
  queryClient.setQueryData(authSessionQueryKey, null);
  notifyError(error.message);

  return true;
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (handleSessionExpired(error)) return;
      if (query.state.data !== undefined) return;

      notifyError(error.message);
    },
  }),
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      const message = mutation.meta?.successMessage;

      if (message) notifySuccess(message);
    },
    onError: (error) => {
      if (handleSessionExpired(error)) return;

      notifyError(error.message);
    },
  }),
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});