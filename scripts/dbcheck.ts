import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const tables = await p.$queryRawUnsafe<{ table_name: string }[]>(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema='public' AND (table_name LIKE 'Identity%' OR table_name='SecurityRateLimitBucket')
     ORDER BY table_name`,
  );
  console.log("tables:", tables.length);
  tables.forEach((t) => console.log(" -", t.table_name));
  const idx = await p.$queryRawUnsafe<{ n: bigint }[]>(
    `SELECT count(*)::bigint AS n FROM pg_indexes
     WHERE schemaname='public' AND (tablename LIKE 'Identity%' OR tablename='SecurityRateLimitBucket')`,
  );
  console.log("indexes:", idx[0].n.toString());
  const enums = await p.$queryRawUnsafe<{ n: bigint }[]>(
    `SELECT count(*)::bigint AS n FROM pg_type WHERE typname LIKE 'Identity%'`,
  );
  console.log("enums:", enums[0].n.toString());
}
main().finally(() => p.$disconnect());
