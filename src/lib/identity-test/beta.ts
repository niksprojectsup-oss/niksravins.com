// Slēgtā beta piekļuves mehānisms — servera puses vārti.
// Uzaicinājuma links: /api/identity-test/redeem?token=<t>&locale=<l>
// Redeem iestata HttpOnly cookie; publiskā lapa un submit API to pārbauda.
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";

export const BETA_COOKIE_NAME = "__it_beta";
const BETA_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 dienas

function tokenHash(token: string): string {
  return createHash("sha256").update(`identity-beta:${token}`).digest("hex");
}

export function generateBetaToken(): { token: string; hash: string } {
  const token = randomBytes(24).toString("base64url");
  return { token, hash: tokenHash(token) };
}

type InviteRow = {
  id: string;
  uses: number;
  maxUses: number;
  expiresAt: Date;
  revokedAt: Date | null;
};

async function findValidInvite(rawToken: string): Promise<InviteRow | null> {
  if (!rawToken || rawToken.length > 128) return null;
  const invite = await prisma.identityBetaInvite.findUnique({
    where: { tokenHash: tokenHash(rawToken) },
    select: { id: true, uses: true, maxUses: true, expiresAt: true, revokedAt: true },
  });
  if (!invite || invite.revokedAt || invite.expiresAt <= new Date() || invite.uses >= invite.maxUses) {
    return null;
  }
  return invite;
}

/** Vienreizēja saites izmantošana: der → inkrementē uses. Lieto redeem maršruts. */
export async function redeemBetaToken(rawToken: string): Promise<boolean> {
  const invite = await findValidInvite(rawToken);
  if (!invite) return false;
  // Atomisks uses+1 ar nosacījumu — sacensību gadījumā limitu nepārsniedz.
  const updated = await prisma.identityBetaInvite.updateMany({
    where: { id: invite.id, uses: { lt: invite.maxUses }, revokedAt: null },
    data: { uses: { increment: 1 } },
  });
  return updated.count === 1;
}

/** Cookie derīguma pārbaudes (nepalielina uses — izmantošana jau reģistrēta redeem brīdī). */
export async function isBetaRequestAllowed(): Promise<boolean> {
  const store = await cookies();
  const raw = store.get(BETA_COOKIE_NAME)?.value;
  if (!raw) return false;
  return (await findValidInvite(raw)) !== null;
}

export function betaCookieOptions() {
  return {
    name: BETA_COOKIE_NAME,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: BETA_COOKIE_MAX_AGE,
  };
}
