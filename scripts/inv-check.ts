import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const rows = await p.$queryRawUnsafe<{ t: string }[]>(
    `SELECT table_name AS t FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`);
  console.log("KOPĀ: " + rows.length);
  for (const r of rows) console.log(" - " + r.t);
  const ident = rows.filter(r => r.t.startsWith("Identity") || r.t === "SecurityRateLimitBucket");
  console.log("IDENTITY+RL: " + ident.length);
  const migs = await p.$queryRawUnsafe<{ m: string; c: string | null }[]>(
    `SELECT migration_name AS m, checksum AS c FROM _prisma_migrations ORDER BY finished_at`);
  for (const m of migs) console.log("MIG " + m.m + " checksum=" + (m.c ?? "").slice(0, 12) + "...");
}
main().finally(() => p.$disconnect());
