"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  createAdminSession,
  revokeAdminSession,
  touchAdminLastLogin,
  verifyAdminCredentials,
} from "@/lib/auth/admin-repository";
import {
  clearSessionCookie,
  createSessionToken,
  getServerSession,
  setSessionCookie,
} from "@/lib/auth/session";
import { MFA_PENDING_MAX_AGE_SECONDS, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/types";
import { logAuditEvent } from "@/lib/security/audit";
import { checkRateLimit } from "@/lib/security/rate-limit";

export type LoginState = {
  error?: string;
};

function getClientIp(headerStore: Headers): string {
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown"
  );
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
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

  const admin = await verifyAdminCredentials(email, password);
  if (!admin) {
    await logAuditEvent({
      action: "auth.login_failed",
      resource: "auth",
      metadata: { email },
      ipAddress,
      userAgent,
    });
    return { error: "Invalid email or password." };
  }

  const mfaVerified = !admin.mfaEnabled;
  const maxAge = mfaVerified ? SESSION_MAX_AGE_SECONDS : MFA_PENDING_MAX_AGE_SECONDS;
  const expiresAt = new Date(Date.now() + maxAge * 1000);

  const provisionalToken = crypto.randomUUID();
  const sessionId = await createAdminSession({
    adminId: admin.id,
    token: provisionalToken,
    expiresAt,
    ipAddress,
    userAgent,
  });

  const token = await createSessionToken(
    {
      sub: admin.id,
      email: admin.email,
      role: "ADMIN",
      clientId: null,
      practitionerId: null,
      sessionId,
      mfaVerified,
    },
    maxAge,
  );

  await setSessionCookie(token, maxAge);
  await touchAdminLastLogin(admin.id);

  await logAuditEvent({
    action: admin.mfaEnabled ? "auth.mfa_required" : "auth.login",
    resource: "auth",
    actorAdminId: admin.id,
    actorRole: "ADMIN",
    ipAddress,
    userAgent,
  });

  if (admin.mfaEnabled) {
    redirect("/admin/login/mfa");
  }

  const nextPath = String(formData.get("next") ?? "");
  if (nextPath.startsWith("/admin")) {
    redirect(nextPath);
  }

  redirect("/admin");
}

export async function logoutAction() {
  const session = await getServerSession();
  const headerStore = await headers();

  if (session) {
    await revokeAdminSession(session.sessionId);
    await logAuditEvent({
      action: "auth.logout",
      resource: "auth",
      actorAdminId: session.id,
      actorRole: "ADMIN",
      ipAddress: getClientIp(headerStore),
      userAgent: headerStore.get("user-agent"),
    });
  }

  await clearSessionCookie();
  redirect("/admin/login");
}
