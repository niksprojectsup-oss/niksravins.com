import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

export const SENSITIVE_FIELD_GROUPS = {
  reactionAnalysis: [
    "mainConcern",
    "triggers",
    "automaticReactions",
    "bodySensations",
    "emotionalResponses",
    "oldPatterns",
    "currentResponses",
    "notes",
  ] as const,
  practitionerNotes: ["practitionerNotes"] as const,
  sessionNotes: ["notes", "changesNoticed", "nextFocus"] as const,
} as const;

export function isEncryptionConfigured(): boolean {
  return Boolean(process.env.ENCRYPTION_KEY);
}

function getEncryptionKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("ENCRYPTION_KEY is required for field encryption.");
  }

  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be 32 bytes encoded as base64.");
  }

  return key;
}

export function encryptField(plaintext: string): string {
  if (!plaintext) return plaintext;
  if (!isEncryptionConfigured()) return plaintext;

  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decryptField(ciphertext: string): string {
  if (!ciphertext) return ciphertext;
  if (!isEncryptionConfigured()) return ciphertext;

  try {
    const key = getEncryptionKey();
    const data = Buffer.from(ciphertext, "base64");
    if (data.length <= IV_LENGTH + TAG_LENGTH) return ciphertext;

    const iv = data.subarray(0, IV_LENGTH);
    const tag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encrypted = data.subarray(IV_LENGTH + TAG_LENGTH);

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch {
    // Supports legacy plaintext rows during migration.
    return ciphertext;
  }
}

export function encryptFields<F extends string, T extends Record<F, string>>(
  data: T,
  fields: readonly F[],
): T {
  const result = { ...data };
  for (const field of fields) {
    result[field] = encryptField(result[field]) as T[F];
  }
  return result;
}

export function decryptFields<F extends string, T extends Record<F, string>>(
  data: T,
  fields: readonly F[],
): T {
  const result = { ...data };
  for (const field of fields) {
    result[field] = decryptField(result[field]) as T[F];
  }
  return result;
}
