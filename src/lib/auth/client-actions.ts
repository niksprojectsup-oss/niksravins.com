"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  consumePasswordSetupToken,
  createClientAuthSession,
  revokeClientAuthSession,
  verifyClientCredentials,
} from "@/lib/auth/client-repository";
import {
  clearSessionCookie,
  createSessionToken,
  getServerSession,
  setSessionCookie,
} from "@/lib/auth/session";
import { SESSION_MAX_AGE_SECONDS } from "@/lib/auth/types";
import { checkRateLimit } from "@/lib/security/rate-limit";

export type ClientAuthState = {
  error?: string;
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

  const rateLimit = checkRateLimit("auth.login", ipAddress);
  if (!rateLimit.allowed) {
    return { error: "Too many login attempts. Try again later." };
  }

  const user = await verifyClientCredentials(email, password);
  if (!user || !user.clientId) {
    return { error: "Invalid email or password." };
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

  if (!token) {
    return { error: "This password link is invalid." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const result = await consumePasswordSetupToken({ token, password });
  if (!result) {
    return { error: "This password link is invalid or has expired." };
  }

  const user = await verifyClientCredentials(result.email, password);
  if (!user || !user.clientId) {
    return { error: "Unable to sign in after setting password. Please log in." };
  }

  await establishClientSession(user);
  redirect("/client/dashboard");
}

export async function clientLogoutAction() {
  const session = await getServerSession();

  if (session?.role === "CLIENT") {
    await revokeClientAuthSession(session.sessionId);
  }

  await clearSessionCookie();
  redirect("/client/login");
}
