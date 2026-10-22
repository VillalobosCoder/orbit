import { ApiRequestError, injectQuery } from "@/api/config";
import { AUTH, ME } from "@/api/uris";
import type { LoginResponseDto } from "@orbit/shared";

export const authSessionQueryKey = [AUTH, ME] as const;

export function getCurrentSession(): Promise<LoginResponseDto | null> {
  return injectQuery<LoginResponseDto>([AUTH, ME]).catch((error: unknown) => {
    if (error instanceof ApiRequestError && error.status === 401) {
      return null;
    }

    throw error;
  });
}
