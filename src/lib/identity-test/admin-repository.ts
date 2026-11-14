import { prisma } from "@/lib/db/prisma";
import { decryptField } from "@/lib/security/encryption";
import { LOCALES } from "@/lib/i18n/config";
import type { IdentityContentEntityType } from "@prisma/client";

/** Satura pilnības matrica vienai entītijai - admin brīdinājumiem. */
export async function getContentCoverage(entityType: IdentityContentEntityType, entityIds: string[]) {
  const rows = await prisma.identityContentTranslation.groupBy({
    by: ["entityId", "locale", "translationStatus"],
    where: { entityType, entityId: { in: entityIds } },
    _count: true,
  });
  const map = new Map<string, Map<string, number>>();
  for (const row of rows) {
    const key = `${row.entityId}:${row.locale}`;
    const inner = map.get(key) ?? new Map<string, number>();
    inner.set(row.translationStatus, (inner.get(row.translationStatus) ?? 0) + row._count);
    map.set(key, inner);
  }
  return map;
}

export async function getIdentityDashboard() {
  const [themes, subcategories, beliefs, beliefByStatus, trunks, branches, deliveries, sequences, submissions, consents] =
    await Promise.all([
      prisma.identityTestTheme.count(),
      prisma.identityTestSubcategory.count(),
      prisma.identityBelief.count(),
      prisma.identityBelief.groupBy({ by: ["status"], _count: true }),
      prisma.identityPositiveTrunk.count(),
      prisma.identityPositiveBranch.count(),
      prisma.identityEmailDelivery.groupBy({ by: ["status"], _count: true }),
      prisma.identityEmailSequence.groupBy({ by: ["status"], _count: true }),
      prisma.identityTestSubmission.count(),
      prisma.identityEmailConsent.count({ where: { marketingConsent: true, withdrawalTimestamp: null } }),
    ]);

  const toMap = (rows: { status: string; _count: number }[]) =>
    Object.fromEntries(rows.map((r) => [r.status, r._count]));

  // Brīdinājumi: PUBLISHED uzskati bez abu portretu fragmentu LV vai EN.
  const publishedBeliefs = await prisma.identityBelief.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, stableKey: true },
  });
  const fragments = await prisma.identityContentTranslation.findMany({
    where: {
      entityType: "BELIEF",
      entityId: { in: publishedBeliefs.map((b) => b.id) },
      field: { in: ["portraitNow", "portraitFuture"] },
      publishedValue: { not: null },
    },
    select: { entityId: true, field: true },
  });
  const fragmentSet = new Set(fragments.map((f) => `${f.entityId}:${f.field}`));
  const incomplete = publishedBeliefs.filter(
    (b) =>
      !fragmentSet.has(`${b.id}:portraitNow`) || !fragmentSet.has(`${b.id}:portraitFuture`),
  );

  return {
    themes,
    subcategories,
    beliefs,
    beliefByStatus: toMap(beliefByStatus),
    trunks,
    branches,
    deliveries: toMap(deliveries),
    sequences: toMap(sequences),
    submissions,
    activeMarketingConsents: consents,
    incompletePublished: incomplete.map((b) => b.stableKey),
  };
}

export async function getTranslationsOverview() {
  const rows = await prisma.identityContentTranslation.groupBy({
    by: ["entityType", "locale", "translationStatus"],
    _count: true,
  });
  const table: Record<string, Record<string, Record<string, number>>> = {};
  for (const row of rows) {
    table[row.entityType] ??= {};
    table[row.entityType][row.locale] ??= {};
    table[row.entityType][row.locale][row.translationStatus] = row._count;
  }
  return { table, locales: LOCALES };
}

export function decryptIfPresent(value: string | null | undefined): string {
  return value ? decryptField(value) : "";
}
