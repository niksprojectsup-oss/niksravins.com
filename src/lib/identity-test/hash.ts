import { createHmac } from "node:crypto";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getHashSecret(): string {
  const secret =
    process.env.ENCRYPTION_KEY?.trim() || process.env.AUTH_SECRET?.trim();
  if (!secret) {
    throw new Error("ENCRYPTION_KEY or AUTH_SECRET is required for hashing.");
  }
  return secret;
}

/** HMAC-SHA256 lookup hash — ļauj atrast ierakstu pēc e-pasta, neuzglabājot to atklāti. */
export function emailHash(email: string): string {
  return createHmac("sha256", getHashSecret())
    .update(normalizeEmail(email))
    .digest("hex");
}
