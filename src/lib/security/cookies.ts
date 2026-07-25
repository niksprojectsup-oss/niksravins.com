import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const SESSION_COOKIE_NAME = "__nr_session";
export const CSRF_COOKIE_NAME = "__nr_csrf";

const isProduction = process.env.NODE_ENV === "production";

export function secureSessionCookieOptions(maxAgeSeconds: number): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export function csrfCookieOptions(maxAgeSeconds: number): Partial<ResponseCookie> {
  return {
    httpOnly: false,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
