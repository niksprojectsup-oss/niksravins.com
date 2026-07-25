import { cookies } from "next/headers";
import type { SessionContext } from "./types";
import { MFA_PENDING_MAX_AGE_SECONDS, SESSION_MAX_AGE_SECONDS } from "./types";
import { SESSION_COOKIE_NAME, secureSessionCookieOptions } from "@/lib/security/cookies";
import { getSessionFromRequest, verifySessionToken } from "./session-token";

export {
  createSessionToken,
  getSessionFromRequest,
  isMfaPendingSession,
  verifySessionToken,
} from "./session-token";

export async function setSessionCookie(
  token: string,
  maxAgeSeconds: number = SESSION_MAX_AGE_SECONDS,
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, secureSessionCookieOptions(maxAgeSeconds));
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getServerSession(): Promise<SessionContext | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export { MFA_PENDING_MAX_AGE_SECONDS, SESSION_MAX_AGE_SECONDS };
