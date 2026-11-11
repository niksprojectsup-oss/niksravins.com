import { checkRateLimit } from "../src/lib/security/rate-limit";
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const id = `rl-test-${Date.now()}`;
  const cfg = { limit: 3, windowMs: 60_000 };
  const r1 = await checkRateLimit("api.general", id, cfg);
  const r2 = await checkRateLimit("api.general", id, cfg);
  const r3 = await checkRateLimit("api.general", id, cfg);
  const r4 = await checkRateLimit("api.general", id, cfg);
  console.log("allowed:", [r1.allowed, r2.allowed, r3.allowed, r4.allowed].join(","),
    "| remaining after 3rd:", r3.remaining);
  const bucket = await p.securityRateLimitBucket.findUnique({ where: { key: `api.general:${id}` } });
  console.log("bucket:", bucket ? `count=${bucket.count}` : "MISSING");
  if (!(r1.allowed && r2.allowed && r3.allowed && !r4.allowed && bucket?.count === 4)) {
    throw new Error("rate limit DB path failed");
  }
  // citi scope lieto citu bucket
  const other = await checkRateLimit("auth.login", id);
  if (!other.allowed) throw new Error("scope isolation failed");
  console.log("✓ rate limit OK (DB path, scope isolation)");
}
main().finally(() => p.$disconnect());
