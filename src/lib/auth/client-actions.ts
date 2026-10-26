"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  consumePasswordSetupToken,
  createClientAuthSession,
  requestClientPasswordReset,
  revokeClientAuthSession,
  verifyClientCredentials,
} from "@/lib/auth/client-repository";
import { acknowledgePasswordReset } from "@/lib/auth/password-reset";
import {
  clearSessionCookie,
  createSessionToken,
  getServerSession,
  setSessionCookie,
} from "@/lib/auth/session";
import { SESSION_MAX_AGE_SECONDS } from "@/lib/auth/types";
import { getPortalContent } from "@/content/i18n/portal";
import { getPortalLocale } from "@/lib/i18n/portal-locale";
import { checkRateLimit } from "@/lib/security/rate-limit";

export type ClientAuthState = {
  error?: string;
  message?: string;
};

function getClientIp(headerStore: Headers): string {
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown"
  );
}

async function establishClientSession(user: {
  id: string;
  email: string;
  clientId: string | null;
}) {
  const headerStore = await headers();
  const ipAddress = getClientIp(headerStore);
  const userAgent = headerStore.get("user-agent");
  const maxAge = SESSION_MAX_AGE_SECONDS;
  const expiresAt = new Date(Date.now() + maxAge * 1000);
  const provisionalToken = crypto.randomUUID();

  const sessionId = await createClientAuthSession({
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
      role: "CLIENT",
      clientId: user.clientId,
      practitionerId: null,
      sessionId,
      mfaVerified: true,
    },
    maxAge,
  );

  await setSessionCookie(token, maxAge);
}

export async function clientLoginAction(
  _prevState: ClientAuthState,
  formData: FormData,
): Promise<ClientAuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const headerStore = await headers();
  const ipAddress = getClientIp(headerStore);

  const copy = getPortalContent(await getPortalLocale()).login;
  const rateLimit = checkRateLimit("auth.login", ipAddress);
  if (!rateLimit.allowed) {
    return { error: copy.tooManyAttempts };
  }

  const user = await verifyClientCredentials(email, password);
  if (!user || !user.clientId) {
    return { error: copy.invalidCredentials };
  }

  await establishClientSession(user);

  const nextPath = String(formData.get("next") ?? "");
  if (nextPath.startsWith("/client")) {
    redirect(nextPath);
  }

  redirect("/client/dashboard");
}

export async function clientSetPasswordAction(
  _prevState: ClientAuthState,
  formData: FormData,
): Promise<ClientAuthState> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const copy = getPortalContent(await getPortalLocale()).setPassword;
  const headerStore = await headers();
  const rateLimit = checkRateLimit(
    "auth.password_reset",
    `set-password:${getClientIp(headerStore)}`,
  );
  if (!rateLimit.allowed) {
    return { error: copy.tooManyAttempts };
  }

  if (!token) {
    return { error: copy.invalidLink };
  }

  if (password.length < 8) {
    return { error: copy.tooShort };
  }

  if (password !== confirmPassword) {
    return { error: copy.mismatch };
  }

  const result = await consumePasswordSetupToken({ token, password });
  if (!result) {
    return { error: copy.expired };
  }

  const user = await verifyClientCredentials(result.email, password);
  if (!user || !user.clientId) {
    return { error: copy.signInFailed };
  }

  await establishClientSession(user);
  redirect("/client/dashboard");
}

export async function clientForgotPasswordAction(
  _prevState: ClientAuthState,
  formData: FormData,
): Promise<ClientAuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const copy = getPortalContent(await getPortalLocale()).forgotPassword;
  const headerStore = await headers();
  const ipAddress = getClientIp(headerStore);
  const ipLimit = checkRateLimit("auth.password_reset", `ip:${ipAddress}`);
  const emailLimit = checkRateLimit("auth.password_reset", `email:${email || "blank"}`);

  if (!ipLimit.allowed || !emailLimit.allowed) {
    return { error: copy.tooManyAttempts };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: copy.invalidEmail };
  }

  try {
    await requestClientPasswordReset(email);
  } catch (error) {
    console.error("[portal] password reset request failed", {
      name: error instanceof Error ? error.name : "unknown",
    });
  }

  return acknowledgePasswordReset(copy.success);
}

export async function clientLogoutAction() {
  const session = await getServerSession();

  if (session?.role === "CLIENT") {
    await revokeClientAuthSession(session.sessionId);
  }

  await clearSessionCookie();
  redirect("/client/login");
}
