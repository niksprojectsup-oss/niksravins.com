/**
 * Redakcionālās sasaistes imports: 200 negatīvie uzskati -> 41 pozitīvais stumbrs.
 *
 * - Upsert pēc (beliefId, trunkId) - idempotentisks, bez dublikātiem.
 * - Validē: visi PUBLISHED uzskati kartoti, visi mērķa stumbri eksistē.
 * - Pēc importa automātiski papildina visu skarto klientu darba plānus
 *   (provisionDevelopmentPlan - pats ir idempotentisks, esošo darbu nedzēš).
 *
 *   npx tsx scripts/belief-trunk-link-import.ts          # DEV (noklusējums)
 *   npx tsx scripts/belief-trunk-link-import.ts --prod   # PROD (apzināts)
 */
import { config } from "dotenv";
import { readFileSync } from "fs";
import { prisma } from "../src/lib/db/prisma";
import { provisionDevelopmentPlan } from "../src/lib/development/plan";

const NOTE = "metodologijas-imports";

// Vides aizsardzība: noklusējumā strādā tikai DEV (.env.local).
// PROD pieļaujams tikai ar --prod un pārbaudītu PROD hostu.
const PROD_FLAG = process.argv.includes("--prod");
const PROD_HOST = "ep-summer-poetry";
if (PROD_FLAG) {
  config({ path: ".env" });
} else {
  config({ path: ".env.local", override: true });
}
const dbHost = new URL(process.env.DATABASE_URL ?? "").host;
if (PROD_FLAG && !dbHost.startsWith(PROD_HOST)) {
  console.error(`--prod režīms, bet DATABASE_URL nav PROD (hosts: ${dbHost})`);
  process.exit(1);
}
if (!PROD_FLAG && dbHost.includes(PROD_HOST)) {
  console.error(`DEV režīms, bet DATABASE_URL norāda uz PROD (${dbHost}). Apturēts.`);
  process.exit(1);
}
console.log(`MĒRĶIS: ${dbHost} [${PROD_FLAG ? "PROD" : "DEV"}]`);

async function main() {
  const { map } = JSON.parse(readFileSync("scripts/belief-trunk-map.json", "utf8")) as {
    map: Record<string, string>;
  };
  const keys = Object.keys(map);
  console.log(`kartes ieraksti: ${keys.length}`);

  const [beliefs, trunks] = await Promise.all([
    prisma.identityBelief.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, stableKey: true },
    }),
    prisma.beliefLibraryTrunk.findMany({
      select: { id: true, libraryKey: true },
    }),
  ]);
  const beliefByKey = new Map(beliefs.map((b) => [b.stableKey, b.id]));
  const trunkByKey = new Map(trunks.map((t) => [t.libraryKey, t.id]));

  // validācija
  const unmapped = beliefs.filter((b) => !map[b.stableKey]);
  const missingTrunks = [...new Set(Object.values(map))].filter((k) => !trunkByKey.has(k));
  const missingBeliefs = keys.filter((k) => !beliefByKey.has(k));
  if (unmapped.length || missingTrunks.length || missingBeliefs.length) {
    console.error("NEKARTOTI uzskati:", unmapped.map((b) => b.stableKey));
    console.error("TRŪKST stumbri:", missingTrunks);
    console.error("Kartē nav DB uzskatu:", missingBeliefs);
    process.exit(1);
  }
  console.log("validācija OK: visi", beliefs.length, "uzskati kartoti, visi mērķa stumbri eksistē");

  // upsert
  let created = 0;
  for (const [stableKey, libraryKey] of Object.entries(map)) {
    const beliefId = beliefByKey.get(stableKey)!;
    const trunkId = trunkByKey.get(libraryKey)!;
    const res = await prisma.beliefTrunkLink.upsert({
      where: { beliefId_trunkId: { beliefId, trunkId } },
      create: { beliefId, trunkId, note: NOTE },
      update: {},
    });
    if (res.createdAt.getTime() > Date.now() - 60_000) created++;
  }
  const total = await prisma.beliefTrunkLink.count();
  console.log(`sasaistes: ${total} (jaunizveidotas šajā palaidā: ${created})`);
  const usedTrunks = new Set(
    (await prisma.beliefTrunkLink.findMany({ select: { trunkId: true } })).map((l) => l.trunkId),
  );
  console.log("izmantoti stumbri:", usedTrunks.size, "no", trunks.length);

  // re-provision skartajiem klientiem
  const linked = await prisma.identityTestSubmission.findMany({
    where: { clientId: { not: null } },
    select: { clientId: true },
  });
  const clientIds = [...new Set(linked.map((s) => s.clientId).filter((v): v is string => Boolean(v)))];
  console.log("klienti ar piesaistītiem iesniegumiem:", clientIds.length);
  for (const cid of clientIds) {
    const r = await provisionDevelopmentPlan(cid);
    console.log(`  ${cid.slice(0, 8)}... -> +${r.added} stumbri`);
  }
  console.log("DONE");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
