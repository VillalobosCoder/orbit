import {
  TokenPayload,
  TokenService,
  VerifiedToken,
} from "../../application/auth/ports/token-service.port.js";
import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import { SESSION_MAX_SECONDS } from "../../application/auth/session.policy.js";

const TOKEN_ISSUER = "orbit-api";
const TOKEN_AUDIENCE = "orbit-api";
const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

export class JwtTokenService implements TokenService {
  private readonly secret: string;

  constructor(secret: string | undefined = process.env.JWT_SECRET) {
    if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
      throw new Error("JWT_SECRET debe tener al menos 32 bytes aleatorios.");
    }

    this.secret = secret;
  }

  sign(payload: TokenPayload): string {
    if (!payload.sub.trim()) {
      throw new Error("El subject del token no puede estar vacío.");
    }

    const { sessionStartedAt, sessionId, ...claims } = payload;

    return jwt.sign(
      {
        ...claims,
        sat: sessionStartedAt ?? Date.now(),
        sid: sessionId ?? randomUUID(),
      },
      this.secret,
      {
        algorithm: "HS256",
        audience: TOKEN_AUDIENCE,
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
        issuer: TOKEN_ISSUER,
      },
    );
  }

  verify(token: string): VerifiedToken {
    const payload = jwt.verify(token, this.secret, {
      algorithms: ["HS256"],
      audience: TOKEN_AUDIENCE,
      issuer: TOKEN_ISSUER,
      maxAge: ACCESS_TOKEN_TTL_SECONDS,
    });

    if (
      typeof payload !== "object" ||
      payload === null ||
      typeof payload.sub !== "string" ||
      !payload.sub.trim() ||
      typeof payload.iat !== "number" ||
      typeof payload.exp !== "number" ||
      payload.exp <= payload.iat ||
      payload.exp - payload.iat > ACCESS_TOKEN_TTL_SECONDS
    ) {
      throw new Error("El token no contiene claims válidos.");
    }

    if (typeof payload.sid !== "string" || !payload.sid) {
      throw new Error("El token no tiene identificador de sesión.");
    }

    const sessionStartedAt =
      typeof payload.sat === "number" ? payload.sat : payload.iat * 1000;

    if (Date.now() - sessionStartedAt > SESSION_MAX_SECONDS * 1000) {
      throw new Error("La sesión superó su duración máxima.");
    }

    return {
      sub: payload.sub,
      mustChangePassword: payload.mustChangePassword === true,
      issuedAt: payload.iat,
      sessionStartedAt,
      sessionId: payload.sid,
    };
  }
}
