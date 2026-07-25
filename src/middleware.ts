import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Admin route protection placeholder.
 * Replace with real auth (NextAuth, Clerk, etc.) before production.
 */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Future: verify admin session and redirect unauthenticated users.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
