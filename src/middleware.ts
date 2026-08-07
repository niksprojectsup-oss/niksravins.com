import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isClientAuthSessionActive } from "@/lib/auth/client-repository";
import { isAdminSessionActive } from "@/lib/auth/admin-repository";
import { getSessionFromRequest } from "@/lib/auth/session-token";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];
const PUBLIC_CLIENT_PATHS = ["/client/login", "/client/set-password"];

function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function isPublicClientPath(pathname: string): boolean {
  return PUBLIC_CLIENT_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (isPublicAdminPath(pathname)) {
      return NextResponse.next();
    }

    const session = await getSessionFromRequest(request);

    if (!session) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (!session.mfaVerified) {
      return NextResponse.redirect(new URL("/admin/login/mfa", request.url));
    }

    const adminSessionActive = await isAdminSessionActive(session.sessionId);
    if (!adminSessionActive) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("error", "Session expired. Please sign in again.");
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/client")) {
    if (isPublicClientPath(pathname)) {
      return NextResponse.next();
    }

    const session = await getSessionFromRequest(request);

    if (!session || session.role !== "CLIENT" || !session.clientId) {
      const loginUrl = new URL("/client/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const clientSessionActive = await isClientAuthSessionActive(session.sessionId);
    if (!clientSessionActive) {
      const loginUrl = new URL("/client/login", request.url);
      loginUrl.searchParams.set("error", "Session expired. Please sign in again.");
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/client/:path*"],
};
