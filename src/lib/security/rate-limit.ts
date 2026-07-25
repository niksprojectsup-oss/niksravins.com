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
  "auth.mfa": { limit: 10, windowMs: 15 * 60 * 1000 },
  "api.general": { limit: 100, windowMs: 60 * 1000 },
  "portal.general": { limit: 60, windowMs: 60 * 1000 },
};

const memoryStore = new Map<string, RateLimitEntry>();

function buildKey(scope: RateLimitScope, identifier: string): string {
  return `${scope}:${identifier}`;
}

/**
 * In-memory rate limiter for development and single-instance deployments.
 * Replace the store with Redis/Upstash for production multi-instance setups.
 */
export function checkRateLimit(
  scope: RateLimitScope,
  identifier: string,
  config: RateLimitConfig = DEFAULT_LIMITS[scope],
): RateLimitResult {
  const key = buildKey(scope, identifier);
  const now = Date.now();
  const existing = memoryStore.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + config.windowMs;
    memoryStore.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetAt,
    };
  }

  if (existing.count >= config.limit) {
    return {
      allowed: false,
      limit: config.limit,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;
  memoryStore.set(key, existing);

  return {
    allowed: true,
    limit: config.limit,
    remaining: config.limit - existing.count,
    resetAt: existing.resetAt,
  };
}

export function getDefaultRateLimit(scope: RateLimitScope): RateLimitConfig {
  return DEFAULT_LIMITS[scope];
}
