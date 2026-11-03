const isProduction = process.env.NODE_ENV === "production";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;

export const accessTokenCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict" as const,
  path: "/",
};

export const accessTokenSetOptions = {
  ...accessTokenCookieOptions,
  maxAge: ACCESS_TOKEN_MAX_AGE_MS,
};
