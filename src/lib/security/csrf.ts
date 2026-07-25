import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { CSRF_COOKIE_NAME } from "./cookies";

const CSRF_TOKEN_BYTES = 32;

function getCsrfSecret(): string {
  const secret = process.env.CSRF_SECRET ?? process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("CSRF_SECRET or AUTH_SECRET is required.");
  }
  return secret;
}

export function generateCsrfToken(): string {
  return randomBytes(CSRF_TOKEN_BYTES).toString("base64url");
}

export function signCsrfToken(token: string): string {
  return createHmac("sha256", getCsrfSecret()).update(token).digest("base64url");
}

export function createCsrfPair(): { token: string; signed: string } {
  const token = generateCsrfToken();
  return { token, signed: signCsrfToken(token) };
}

export async function getCsrfTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value ?? null;
}

export function validateCsrfToken(
  cookieToken: string | null | undefined,
  submittedToken: string | null | undefined,
): boolean {
  if (!cookieToken || !submittedToken) return false;

  const expected = signCsrfToken(cookieToken);
  const provided = submittedToken.length === expected.length ? submittedToken : "";

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
  } catch {
    return false;
  }
}

/**
 * Use for future API routes and non-Next server actions.
 * Server Actions on same origin receive built-in CSRF protection from Next.js.
 */
export async function assertCsrfToken(submittedToken: string | null | undefined): Promise<void> {
  const cookieToken = await getCsrfTokenFromCookies();
  if (!validateCsrfToken(cookieToken, submittedToken)) {
    throw new Error("Invalid CSRF token.");
  }
}
