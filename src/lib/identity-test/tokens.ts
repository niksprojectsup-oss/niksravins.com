import { createHmac, timingSafeEqual } from "node:crypto";

function getTokenSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim() || process.env.ENCRYPTION_KEY?.trim();
  if (!secret) {
    throw new Error("AUTH_SECRET is required for unsubscribe tokens.");
  }
  return secret;
}

/** Atteikšanās tokens: consentId + HMAC paraksts. Bez logina, beztermiņa, atsaucams tikai šim consent ierakstam. */
export function createUnsubscribeToken(consentId: string): string {
  const signature = createHmac("sha256", getTokenSecret())
    .update(`identity-unsubscribe:${consentId}`)
    .digest("base64url")
    .slice(0, 32);
  return `${consentId}.${signature}`;
}

export function verifyUnsubscribeToken(token: string): string | null {
  const [consentId, signature] = token.split(".");
  if (!consentId || !signature) return null;
  const expected = createUnsubscribeToken(consentId).split(".")[1];
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return consentId;
}
