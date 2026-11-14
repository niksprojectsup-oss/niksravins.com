import { prisma } from "@/lib/db/prisma";
import type { RateLimitScope } from "./types";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export type RateLimitConfig = {
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

const DEFAULT_LIMITS: Record<RateLimitScope, RateLimitConfig> = {
  "auth.login": { limit: 5, windowMs: 15 * 60 * 1000 },
  "auth.password_reset": { limit: 5, windowMs: 15 * 60 * 1000 },
  "auth.mfa": { limit: 10, windowMs: 15 * 60 * 1000 },
  "api.general": { limit: 100, windowMs: 60 * 1000 },
  "portal.general": { limit: 60, windowMs: 60 * 1000 },
};

const memoryStore = new Map<string, RateLimitEntry>();

function buildKey(scope: RateLimitScope, identifier: string): string {
  return `${scope}:${identifier}`;
}

function memoryCheck(scope: RateLimitScope, identifier: string, config: RateLimitConfig): RateLimitResult {
  const key = buildKey(scope, identifier);
  const now = Date.now();
  const existing = memoryStore.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + config.windowMs;
    memoryStore.set(key, { count: 1, resetAt });
    return { allowed: true, limit: config.limit, remaining: config.limit - 1, resetAt };
  }
  if (existing.count >= config.limit) {
    return { allowed: false, limit: config.limit, remaining: 0, resetAt: existing.resetAt };
  }
  existing.count += 1;
  return {
    allowed: true,
    limit: config.limit,
    remaining: config.limit - existing.count,
    resetAt: existing.resetAt,
  };
}

/**
 * Kopīgs fixed-window rate limiter, kas glabā skaitītājus Postgres
 * (`SecurityRateLimitBucket`) - darbojas Vercel multi-instance vidē.
 * Upsert ir atomisks viens vaicājums: paralēli instance pieprasījumi
 * nezaudē skaitītāju. DB kļūdas gadījumā - in-memory rezerve
 * (labāks par pilnu rate-limit atteikšanos).
 */
export async function checkRateLimit(
  scope: RateLimitScope,
  identifier: string,
  config: RateLimitConfig = DEFAULT_LIMITS[scope],
): Promise<RateLimitResult> {
  const key = buildKey(scope, identifier);
  try {
    const rows = await prisma.$queryRaw<{ count: number; resetAt: Date }[]>`
      INSERT INTO "SecurityRateLimitBucket" ("key", "count", "resetAt", "updatedAt")
      VALUES (${key}, 1, ${new Date(Date.now() + config.windowMs)}, now())
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "SecurityRateLimitBucket"."resetAt" <= now()
          THEN 1
          ELSE "SecurityRateLimitBucket"."count" + 1
        END,
        "resetAt" = CASE
          WHEN "SecurityRateLimitBucket"."resetAt" <= now()
          THEN ${new Date(Date.now() + config.windowMs)}
          ELSE "SecurityRateLimitBucket"."resetAt"
        END,
        "updatedAt" = now()
      RETURNING "count", "resetAt"
    `;
    const row = rows[0];
    if (row) {
      const resetAt = row.resetAt.getTime();
      return {
        allowed: row.count <= config.limit,
        limit: config.limit,
        remaining: Math.max(0, config.limit - row.count),
        resetAt,
      };
    }
  } catch {
    // DB nepieejama - atgriežamies pie in-memory (attīstība/testi).
  }
  return memoryCheck(scope, identifier, config);
}

/** Periodiskā tīrīšana - izsauc cron maršrutā. */
export async function pruneRateLimitBuckets(): Promise<number> {
  const result = await prisma.securityRateLimitBucket.deleteMany({
    where: { resetAt: { lt: new Date() } },
  });
  return result.count;
}

export function getDefaultRateLimit(scope: RateLimitScope): RateLimitConfig {
  return DEFAULT_LIMITS[scope];
}
