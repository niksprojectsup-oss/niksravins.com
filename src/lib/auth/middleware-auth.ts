/**
 * Edge-compatible auth helpers for middleware / Proxy.
 * Must not import Prisma, node:crypto, bcrypt, or other Node-only modules.
 */
import type { NextRequest } from "next/server";
import type { SessionContext } from "./types";
import { getSessionFromRequest } from "./session-token";

export { getSessionFromRequest, verifySessionToken } from "./session-token";

export function isValidAdminSession(
  session: SessionContext | null,
): session is SessionContext & { role: "ADMIN" } {
  return session?.role === "ADMIN";
}

export function isValidClientSession(session: SessionContext | null): session is SessionContext & {
  clientId: string;
} {
  return session?.role === "CLIENT" && typeof session.clientId === "string";
}

export async function getMiddlewareSession(
  request: NextRequest,
): Promise<SessionContext | null> {
  return getSessionFromRequest(request);
}
