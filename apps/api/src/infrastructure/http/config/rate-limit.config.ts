export type RateLimitConfig = {
  windowMs: number;
  limit: number;
};

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

export const RATE_LIMITS = {
  login: { windowMs: FIFTEEN_MINUTES_MS, limit: 5 },
  changePassword: { windowMs: FIFTEEN_MINUTES_MS, limit: 10 },
} as const satisfies Record<string, RateLimitConfig>;
