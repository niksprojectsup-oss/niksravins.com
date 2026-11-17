/**
 * DEV/Production satura normalizācija:
 * 1) Atjaunina LV portretu fragmentus no prisma/identity-portraits-lv.jsonl.
 * 2) Normalizē domuzīmes uz "-" (em/en dash) visos lietotājam redzamajos DB laukos.
 *
 *   npx tsx scripts/normalize-dashes-and-lv-content.ts          # DEV (noklusējums)
 *   npx tsx scripts/normalize-dashes-and-lv-content.ts --prod   # PROD (apzināts)
 */
import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { prisma } from "../src/lib/db/prisma";

const EM = "\u2014";
const EN = "\u2013";
const fix = (s: string | null | undefined) =>
  s == null ? s : s.split(EM).join("-").split(EN).join("-");

// Vides aizsardzība: noklusējumā strādā tikai DEV (.env.local).
// PROD pieļaujams tikai ar --prod un pārbaudītu PROD hostu.
const PROD_FLAG = process.argv.includes("--prod");
const PROD_HOST = "ep-summer-poetry";
if (PROD_FLAG) {
  config({ path: ".env" });
} else {
  config({ path: ".env.local", override: true });
}
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL nav iestatīts. Apturēts pirms jebkāda savienojuma.");
  process.exit(1);
}
let dbHost: string;
try {
  dbHost = new URL(dbUrl).host;
} catch {
  console.error("DATABASE_URL nav derīgs URL. Apturēts.");
  process.exit(1);
}
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
  // 1) LV portreti no jsonl
  const rows = readFileSync("prisma/identity-portraits-lv.jsonl", "utf-8")
    .split("\n").filter(Boolean).map((l) => JSON.parse(l));
  console.log(`plānotais apjoms: ${rows.length * 2} LV portretu lauki (${rows.length} uzskati x 2) + domuzimju normalizacija`);
  let updated = 0;
  for (const r of rows) {
    const belief = await prisma.identityBelief.findUnique({ where: { stableKey: r.key }, select: { id: true } });
    if (!belief) throw new Error(`Belief not found: ${r.key}`);
    for (const field of ["portraitNow", "portraitFuture"] as const) {
      const value = field === "portraitNow" ? r.now : r.future;
      await prisma.identityContentTranslation.updateMany({
        where: { entityType: "BELIEF", entityId: belief.id, field, locale: "lv" },
        data: { draftValue: value, publishedValue: value },
      });
      updated += 1;
    }
  }
  console.log("LV portrait fields updated:", updated);

  // 2) Domuzīmju normalizācija visās tulkojumu vērtībās
  const tr = await prisma.identityContentTranslation.findMany({
    where: { OR: [{ draftValue: { contains: EM } }, { draftValue: { contains: EN } },
                  { publishedValue: { contains: EM } }, { publishedValue: { contains: EN } }] },
    select: { id: true, draftValue: true, publishedValue: true },
  });
  console.log(`domuzimju normalizacija: ${tr.length} tulkojumu rindas`);
  for (const t of tr) {
    await prisma.identityContentTranslation.update({
      where: { id: t.id },
      data: { draftValue: fix(t.draftValue)!, publishedValue: fix(t.publishedValue) },
    });
  }
  console.log("identityContentTranslation rows normalized:", tr.length);

  // 3) CMS saturs (draftJson/publishedJson/plainText)
  const cms = await prisma.cmsContentItem.findMany({
    where: { OR: [{ plainText: { contains: EM } }, { plainText: { contains: EN } }] },
    select: { id: true, sectionId: true, locale: true, fieldKey: true, plainText: true },
  });
  console.log(`cms kandidati ar domuzimem plainText: ${cms.length}`);
  const fixJson = (v: unknown): unknown =>
    typeof v === "string" ? fix(v)
    : Array.isArray(v) ? v.map(fixJson)
    : v && typeof v === "object"
      ? Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, val]) => [k, fixJson(val)]))
      : v;
  for (const c of cms) {
    const full = await prisma.cmsContentItem.findUnique({ where: { id: c.id } });
    await prisma.cmsContentItem.update({
      where: { id: c.id },
      data: {
        plainText: fix(c.plainText),
        draftJson: full?.draftJson == null ? undefined : (fixJson(full.draftJson) as object),
        publishedJson: full?.publishedJson == null ? undefined : (fixJson(full.publishedJson) as object),
      },
    });
  }
  // JSON lauki var saturēt domuzīmes arī bez plainText - pilns JSON pārgājiens
  const allCms = await prisma.cmsContentItem.findMany({ select: { id: true, draftJson: true, publishedJson: true } });
  let jsonFixed = 0;
  for (const c of allCms) {
    const d = c.draftJson == null ? null : JSON.stringify(c.draftJson);
    const p = c.publishedJson == null ? null : JSON.stringify(c.publishedJson);
    const hasDash = (s: string | null) => s != null && (s.includes(EM) || s.includes(EN));
    if (hasDash(d) || hasDash(p)) {
      await prisma.cmsContentItem.update({
        where: { id: c.id },
        data: {
          draftJson: c.draftJson == null ? undefined : (fixJson(c.draftJson) as object),
          publishedJson: c.publishedJson == null ? undefined : (fixJson(c.publishedJson) as object),
        },
      });
      jsonFixed += 1;
    }
  }
  console.log("cmsContentItem rows normalized:", cms.length, "+ json-only:", jsonFixed);
}

main().finally(() => prisma.$disconnect());
