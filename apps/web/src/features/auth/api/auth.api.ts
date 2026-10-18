import { HttpMethod, injectQuery, ApiRequestError } from "@/api/config";
import { AUTH, LOGIN, LOGOUT, ME } from "@/api/uris";
import type {
  LoginRequestDto,
  LoginResponseDto,
} from "@orbit/shared";

export const authSessionQueryKey = ["auth", "session"] as const;

export function getCurrentSession(): Promise<LoginResponseDto | null> {
  return injectQuery<LoginResponseDto>([AUTH, ME]).catch((error: unknown) => {
    if (error instanceof ApiRequestError && error.status === 401) {
      return null;
    }

    throw error;
  });
}

export async function login(
  credentials: LoginRequestDto,
): Promise<LoginResponseDto> {
  const response = await injectQuery<LoginResponseDto>([AUTH, LOGIN], {
    method: HttpMethod.POST,
    body: JSON.stringify(credentials),
  });

  if (!response) {
    throw new Error("La API no devolvió los datos de la sesión.");
  }

  return response;
}

export function logout(): Promise<null> {
  return injectQuery<null>([AUTH, LOGOUT], { method: HttpMethod.POST });
}
