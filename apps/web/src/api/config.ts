import { ERROR_500, type ApiError, type ApiErrorResponseDto } from "@orbit/shared";

function resolveApiUrl(configuredUrl?: string) {
  return import.meta.env.PROD ? "/api" : configuredUrl ?? "/api";
}

const AUTH_API_URL = resolveApiUrl(import.meta.env.VITE_AUTH_API_URL);

export function resolveAssetUrl(path: string) {
  return `${AUTH_API_URL}${path}`;
}

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

const NETWORK_ERROR_MESSAGE =
  "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";
const TIMEOUT_ERROR_MESSAGE =
  "El servidor tardó demasiado en responder. Inténtalo de nuevo en unos minutos.";
const SERVICE_UNAVAILABLE_MESSAGE =
  "El servicio no está disponible por el momento. Inténtalo de nuevo más tarde.";
const UNEXPECTED_ERROR_MESSAGE =
  "Ocurrió un error inesperado. Inténtalo de nuevo.";

function isTimeoutError(error: unknown) {
  return (
    error instanceof DOMException &&
    (error.name === "TimeoutError" || error.name === "AbortError")
  );
}

function describeFailedResponse(status: number) {
  return status >= 500 ? SERVICE_UNAVAILABLE_MESSAGE : UNEXPECTED_ERROR_MESSAGE;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
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

  let response: Response;

  try {
    response = await fetch(`${baseUrl}/${endpoint}${query}`, {
      ...options,
      headers,
      credentials: options.credentials ?? "include",
      signal: options.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (options.signal?.aborted) {
      throw error;
    }

    throw new ApiRequestError(
      isTimeoutError(error) ? TIMEOUT_ERROR_MESSAGE : NETWORK_ERROR_MESSAGE,
      0,
    );
  }

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    const text = await response.text();

    if (contentType.includes("application/json") && text) {
      const body = parseJson(text);

      if (isApiErrorResponse(body)) {
        throw new ApiRequestError(body.error, response.status);
      }
    }

    throw new ApiRequestError(
      describeFailedResponse(response.status),
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