import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const rows = await p.$queryRawUnsafe<{ n: bigint }[]>(
    `SELECT count(*)::bigint AS n FROM information_schema.tables WHERE table_schema='public'`,
  );
  console.log("public tables:", rows[0].n.toString());
  const names = await p.$queryRawUnsafe<{ table_name: string }[]>(
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name LIMIT 15`,
  );
  names.forEach((t) => console.log(" -", t.table_name));
  const migTable = await p.$queryRawUnsafe<{ n: bigint }[]>(
    `SELECT count(*)::bigint AS n FROM information_schema.tables WHERE table_name='_prisma_migrations'`,
  );
  console.log("_prisma_migrations exists:", migTable[0].n.toString());
}
main().finally(() => p.$disconnect());
