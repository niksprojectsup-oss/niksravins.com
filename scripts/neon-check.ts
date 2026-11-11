import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const rows = await p.$queryRawUnsafe<{ n: bigint }[]>(
    `SELECT count(*)::bigint AS n FROM information_schema.tables WHERE table_name LIKE 'Identity%'`,
  );
  console.log("Identity* tables on this DB:", rows[0].n.toString());
  const mig = await p.$queryRawUnsafe<{ migration_name: string }[]>(
    `SELECT migration_name FROM "_prisma_migrations" ORDER BY finished_at`,
  );
  console.log("applied migrations:", mig.map((m) => m.migration_name).join(", "));
}
main().finally(() => p.$disconnect());
