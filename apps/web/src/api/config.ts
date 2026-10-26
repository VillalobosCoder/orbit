import { ERROR_500, type ApiError, type ApiErrorResponseDto } from "@orbit/shared";

function resolveApiUrl(configuredUrl?: string) {
  return import.meta.env.PROD ? "/api" : configuredUrl ?? "/api";
}

const AUTH_API_URL = resolveApiUrl(import.meta.env.VITE_AUTH_API_URL);

const REQUEST_TIMEOUT_MS = 15_000;

export const HttpMethod = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
} as const;

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

function isApiErrorResponse(body: unknown): body is ApiErrorResponseDto {
  return (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "string"
  );
}

function buildEndpoint(segments: string[]) {
  const normalized = segments.map((segment) =>
    segment.replace(/^\/?|\/?$/g, ""),
  );
  const endpoint = normalized.filter(Boolean).join("/");
  return segments.at(-1) === "" ? `${endpoint}/` : endpoint;
}

async function requestQuery<T>(
  baseUrl: string,
  segments: string[],
  options: RequestInit = {},
  params?: Record<string, string | number>,
): Promise<T | null> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const endpoint = buildEndpoint(segments);
  const query = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params).map(([key, value]) => [key, String(value)]),
      ).toString()
    : "";

  const response = await fetch(`${baseUrl}/${endpoint}${query}`, {
    ...options,
    headers,
    credentials: options.credentials ?? "include",
    signal: options.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    const text = await response.text();

    if (contentType.includes("application/json") && text) {
      const body: unknown = JSON.parse(text);

      if (isApiErrorResponse(body)) {
        throw new ApiRequestError(body.error, response.status);
      }

      throw new ApiRequestError(
        `La API devolvió un error inválido (HTTP ${response.status}).`,
        response.status,
      );
    }

    throw new ApiRequestError(
      text || `La solicitud falló (HTTP ${response.status}).`,
      response.status,
    );
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

export async function injectQuery<T = unknown>(
  segments: string[],
  options: RequestInit = {},
  params?: Record<string, string | number>,
): Promise<T | null> {
  return requestQuery<T>(AUTH_API_URL, segments, options, params);
}


/** Para consultas GET: una respuesta vacía se trata como error, no como `null`. */
export async function requireData<T>(
  request: Promise<T | null>,
  message: string,
): Promise<T> {
  const data = await request;

  if (!data) {
    throw new Error(message);
  }

  return data;
}

export function handleMutationError(error: unknown) {
  const apiError = error as ApiError;
  if (apiError.message) {
    console.log(apiError.message);
    return;
  }
  console.log(ERROR_500);
}