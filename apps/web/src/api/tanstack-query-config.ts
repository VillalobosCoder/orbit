import { QueryClient } from "@tanstack/react-query";

function shouldRetry(failureCount: number, error: unknown) {
  const status = typeof error === "object" && error !== null && "status" in error
    ? Number(error.status)
    : undefined;

  if (status !== undefined && [400, 401, 403, 404].includes(status)) {
    return false;
  }

  return failureCount < 2;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});