// Read-only production untouched-check: DB URL tieši no .env (ne .env.local).
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const env = readFileSync(".env", "utf8");
const url = env.match(/^DATABASE_URL="?([^"\n]+)"?/m)?.[1];
if (!url || !url.includes("ep-summer-poetry")) {
  throw new Error(".env DATABASE_URL nav production endpoint - pārbaudi manuāli");
}
const p = new PrismaClient({ datasources: { db: { url } } });
async function main() {
  const identity = await p.$queryRawUnsafe<{ n: bigint }[]>(
    `SELECT count(*)::bigint AS n FROM information_schema.tables WHERE table_name LIKE 'Identity%' OR table_name='SecurityRateLimitBucket'`,
  );
  const mig = await p.$queryRawUnsafe<{ migration_name: string }[]>(
    `SELECT migration_name FROM "_prisma_migrations" ORDER BY finished_at`,
  );
  console.log("PROD Identity/RL tables:", identity[0].n.toString());
  console.log("PROD applied migrations:", mig.map((m) => m.migration_name).join(","));
}
main().finally(() => p.$disconnect());
