import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session-token";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some(
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

    return NextResponse.next();
  }

  // Future client portal protection:
  // if (pathname.startsWith("/portal")) { ... require CLIENT role ... }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
