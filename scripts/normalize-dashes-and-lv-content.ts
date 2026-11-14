/**
 * DEV/Production satura normalizācija:
 * 1) Atjaunina LV portretu fragmentus no prisma/identity-portraits-lv.jsonl.
 * 2) Normalizē domuzīmes uz "-" (em/en dash) visos lietotājam redzamajos DB laukos.
 * Palaišana: npx tsx scripts/normalize-dashes-and-lv-content.ts
 * PIESARDZĪGI: pirms Production palaišanas pārbaudīt DATABASE_URL hostu.
 */
import { readFileSync } from "node:fs";
import { prisma } from "../src/lib/db/prisma";

const EM = "\u2014";
const EN = "\u2013";
const fix = (s: string | null | undefined) =>
  s == null ? s : s.split(EM).join("-").split(EN).join("-");

async function main() {
  // 1) LV portreti no jsonl
  const rows = readFileSync("prisma/identity-portraits-lv.jsonl", "utf-8")
    .split("\n").filter(Boolean).map((l) => JSON.parse(l));
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
