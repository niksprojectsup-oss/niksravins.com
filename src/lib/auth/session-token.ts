import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import type { AuthSessionPayload, SessionContext } from "./types";
import { SESSION_MAX_AGE_SECONDS } from "./types";
import { SESSION_COOKIE_NAME } from "@/lib/security/cookies";
import type { Role } from "@/lib/security/types";

function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET must be at least 32 characters.");
    }
    return new TextEncoder().encode(
      "development-only-auth-secret-minimum-32-characters",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(
  payload: AuthSessionPayload,
  maxAgeSeconds: number = SESSION_MAX_AGE_SECONDS,
): Promise<string> {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
    clientId: payload.clientId ?? null,
    practitionerId: payload.practitionerId ?? null,
    sessionId: payload.sessionId,
    mfaVerified: payload.mfaVerified,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(getAuthSecret());
}

export async function verifySessionToken(token: string): Promise<SessionContext | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    const sub = payload.sub;
    const email = payload.email;
    const role = payload.role;
    const sessionId = payload.sessionId;

    if (
      typeof sub !== "string" ||
      typeof email !== "string" ||
      typeof role !== "string" ||
      typeof sessionId !== "string"
    ) {
      return null;
    }

    if (role !== "ADMIN" && role !== "CLIENT") {
      return null;
    }

    return {
      id: sub,
      email,
      role: role as Role,
      clientId: typeof payload.clientId === "string" ? payload.clientId : null,
      practitionerId:
        typeof payload.practitionerId === "string" ? payload.practitionerId : null,
      sessionId,
      mfaVerified: payload.mfaVerified === true,
      mfaEnabled: false,
    };
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(
  request: NextRequest,
): Promise<SessionContext | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function isMfaPendingSession(session: SessionContext): boolean {
  return session.mfaVerified === false;
}
