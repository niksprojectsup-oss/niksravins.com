"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  createAuthSessionRecord,
  revokeAuthSession,
  verifyUserCredentials,
} from "@/lib/auth/repository";
import {
  clearSessionCookie,
  createSessionToken,
  getServerSession,
  setSessionCookie,
} from "@/lib/auth/session";
import { MFA_PENDING_MAX_AGE_SECONDS, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/types";
import { logAuditEvent } from "@/lib/security/audit";
import { checkRateLimit } from "@/lib/security/rate-limit";

function getClientIp(headerStore: Headers): string {
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown"
  );
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const headerStore = await headers();
  const ipAddress = getClientIp(headerStore);
  const userAgent = headerStore.get("user-agent");

  const rateLimit = checkRateLimit("auth.login", ipAddress);
  if (!rateLimit.allowed) {
    await logAuditEvent({
      action: "auth.login_failed",
      resource: "auth",
      metadata: { reason: "rate_limited", email },
      ipAddress,
      userAgent,
    });
    return { error: "Too many login attempts. Try again later." };
  }

  const user = await verifyUserCredentials(email, password);
  if (!user) {
    await logAuditEvent({
      action: "auth.login_failed",
      resource: "auth",
      metadata: { email },
      ipAddress,
      userAgent,
    });
    return { error: "Invalid email or password." };
  }

  const mfaVerified = !user.mfaEnabled;
  const maxAge = mfaVerified ? SESSION_MAX_AGE_SECONDS : MFA_PENDING_MAX_AGE_SECONDS;
  const expiresAt = new Date(Date.now() + maxAge * 1000);

  const provisionalToken = crypto.randomUUID();
  const sessionId = await createAuthSessionRecord({
    userId: user.id,
    token: provisionalToken,
    expiresAt,
    ipAddress,
    userAgent,
  });

  const token = await createSessionToken(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      clientId: user.clientId,
      practitionerId: user.practitionerId,
      sessionId,
      mfaVerified,
    },
    maxAge,
  );

  await setSessionCookie(token, maxAge);

  await logAuditEvent({
    action: user.mfaEnabled ? "auth.mfa_required" : "auth.login",
    resource: "auth",
    actorId: user.id,
    actorRole: user.role,
    ipAddress,
    userAgent,
  });

  if (user.mfaEnabled) {
    redirect("/admin/login/mfa");
  }

  const nextPath = String(formData.get("next") ?? "");
  if (nextPath.startsWith("/admin") && user.role === "ADMIN") {
    redirect(nextPath);
  }

  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  redirect("/portal");
}

export async function logoutAction() {
  const session = await getServerSession();
  const headerStore = await headers();

  if (session) {
    await revokeAuthSession(session.sessionId);
    await logAuditEvent({
      action: "auth.logout",
      resource: "auth",
      actorId: session.id,
      actorRole: session.role,
      ipAddress: getClientIp(headerStore),
      userAgent: headerStore.get("user-agent"),
    });
  }

  await clearSessionCookie();
  redirect("/admin/login");
}
