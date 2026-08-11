import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getMiddlewareSession,
  isValidAdminSession,
  isValidClientSession,
} from "@/lib/auth/middleware-auth";

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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (isPublicAdminPath(pathname)) {
      return NextResponse.next();
    }

    const session = await getMiddlewareSession(request);

    if (!isValidAdminSession(session)) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!session.mfaVerified) {
      return NextResponse.redirect(new URL("/admin/login/mfa", request.url));
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/client")) {
    if (isPublicClientPath(pathname)) {
      return NextResponse.next();
    }

    const session = await getMiddlewareSession(request);

    if (!isValidClientSession(session)) {
      const loginUrl = new URL("/client/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/client/:path*"],
};
