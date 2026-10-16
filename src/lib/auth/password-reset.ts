import { createHash } from "node:crypto";

/** Password reset links expire sooner than the 7-day portal setup link. */
export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

export function hashPasswordToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Same acknowledgement for every well-formed request, so the reply cannot reveal an account. */
export function acknowledgePasswordReset(message: string): { message: string } {
  return { message };
}

export type PasswordTokenSnapshot = {
  usedAt: Date | null;
  expiresAt: Date;
  role: string;
} | null;

export type PasswordTokenRejection = "missing" | "used" | "expired" | "not_client";

export function passwordTokenRejectionReason(
  token: PasswordTokenSnapshot,
  now: number,
): PasswordTokenRejection | null {
  if (!token) return "missing";
  if (token.usedAt) return "used";
  if (token.expiresAt.getTime() <= now) return "expired";
  if (token.role !== "CLIENT") return "not_client";
  return null;
}

export function isEligiblePasswordResetAccount<T extends { role: string }>(
  user: T | null | undefined,
): user is T {
  return user?.role === "CLIENT";
}
