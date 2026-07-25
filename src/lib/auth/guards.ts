import { redirect } from "next/navigation";
import { canAccessClientData } from "@/lib/security/permissions";
import type { Permission } from "@/lib/security/types";
import { hasPermission } from "@/lib/security/permissions";
import { getServerSession } from "./session";
import type { SessionContext } from "./types";

export class AuthorizationError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function requireAuth(): Promise<SessionContext> {
  const session = await getServerSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

export async function requireAdmin(): Promise<SessionContext> {
  const session = await requireAuth();
  if (session.role !== "ADMIN") {
    redirect("/admin/login");
  }
  if (!session.mfaVerified) {
    redirect("/admin/login/mfa");
  }
  return session;
}

export async function requirePermission(permission: Permission): Promise<SessionContext> {
  const session = await requireAuth();
  if (!hasPermission(session.role, permission)) {
    throw new AuthorizationError();
  }
  return session;
}

export async function requireClientAccess(clientId: string): Promise<SessionContext> {
  const session = await requireAuth();
  if (!canAccessClientData(session.role, session.clientId, clientId)) {
    throw new AuthorizationError("You can only access your own data.");
  }
  return session;
}

export async function getOptionalSession(): Promise<SessionContext | null> {
  return getServerSession();
}
