/**
 * Automātiskā klienta darba plāna sagatavošana.
 *
 * Pēc testa iesnieguma piesaistes: nolasa klienta negatīvos uzskatus,
 * atrod speciālista apstiprinātās BeliefTrunkLink atbilstības un izveido
 * ClientDevelopmentTrunk + ClientDevelopmentBranch no kartotēkas.
 *
 * Idempotentisks: jau esošs stumbrs netiek dublēts; jauni uzskati
 * (atkārtots tests) papildina beliefIds sarakstu.
 */
import { prisma } from "@/lib/db/prisma";

export async function provisionDevelopmentPlan(
  clientId: string,
  actorAdminId?: string | null,
): Promise<{ added: number; linked: number }> {
  // 1) visas klienta piesaistītās submissions → beliefIds
  const submissions = await prisma.identityTestSubmission.findMany({
    where: { clientId },
    select: { selectedBeliefIds: true },
  });
  const beliefIds = [...new Set(submissions.flatMap((s) => s.selectedBeliefIds))];
  if (beliefIds.length === 0) return { added: 0, linked: 0 };

  // 2) apstiprinātās atbilstības šiem uzskatiem
  const links = await prisma.beliefTrunkLink.findMany({
    where: { beliefId: { in: beliefIds } },
    include: { trunk: { include: { branches: { orderBy: { sortOrder: "asc" } } } } },
  });
  if (links.length === 0) return { added: 0, linked: 0 };

  // 3) grupē: trunkId → beliefIds (vairāki uzskati uz vienu stumbru)
  const byTrunk = new Map<string, { trunk: (typeof links)[0]["trunk"]; beliefIds: string[] }>();
  for (const l of links) {
    const entry = byTrunk.get(l.trunkId) ?? { trunk: l.trunk, beliefIds: [] };
    if (!entry.beliefIds.includes(l.beliefId)) entry.beliefIds.push(l.beliefId);
    byTrunk.set(l.trunkId, entry);
  }

  // 4) jau esošie plāna stumbri
  const existing = await prisma.clientDevelopmentTrunk.findMany({
    where: { clientId },
    select: { id: true, libraryTrunkId: true, beliefIds: true, beliefId: true, sortOrder: true },
  });
  const existingByLib = new Map(existing.map((t) => [t.libraryTrunkId, t]));
  const maxSort = existing.reduce((m, t) => Math.max(m, t.sortOrder), 0);

  let added = 0;

  await prisma.$transaction(async (tx) => {
    let cursor = maxSort;
    for (const [trunkId, entry] of byTrunk) {
      const lib = entry.trunk;
      const ex = existingByLib.get(trunkId);
      if (ex) {
        // papildinām trūkstošos beliefIds (atkārtots tests / jauna atbilstība)
        const missing = entry.beliefIds.filter((b) => !ex.beliefIds.includes(b));
        if (missing.length) {
          await tx.clientDevelopmentTrunk.update({
            where: { id: ex.id },
            data: {
              beliefIds: [...ex.beliefIds, ...missing],
              beliefId: ex.beliefId ?? missing[0],
            },
          });
          await tx.clientDevelopmentEvent.create({
            data: {
              clientId, trunkId: ex.id, action: "TRUNK_BELIEFS_UPDATED",
              detail: `Papildināts ar uzskatiem: ${missing.length}`,
              actorAdminId: actorAdminId ?? null,
            },
          });
        }
        continue;
      }

      cursor += 1;
      const trunk = await tx.clientDevelopmentTrunk.create({
        data: {
          clientId,
          libraryTrunkId: lib.id,
          beliefId: entry.beliefIds[0] ?? null,
          beliefIds: entry.beliefIds,
          origin: "LIBRARY",
          titleLv: lib.titleLv,
          titleEn: lib.titleEn,
          sortOrder: cursor,
          branches: {
            create: lib.branches.map((b) => ({
              libraryBranchId: b.id,
              textLv: b.textLv,
              textEn: b.textEn,
              sortOrder: b.sortOrder,
            })),
          },
        },
      });
      await tx.clientDevelopmentEvent.create({
        data: {
          clientId, trunkId: trunk.id, action: "TRUNK_AUTO_ADDED",
          newStatus: "NOT_STARTED",
          detail: `Auto-plāns no kartotēkas ${lib.libraryKey}`,
          actorAdminId: actorAdminId ?? null,
        },
      });
      added += 1;
    }
  });

  return { added, linked: links.length };
}

/** Klienti, kuriem piesaistītie iesniegumi satur konkrētu uzskatu. */
export async function clientsForBelief(beliefId: string): Promise<string[]> {
  const subs = await prisma.identityTestSubmission.findMany({
    where: { clientId: { not: null }, selectedBeliefIds: { has: beliefId } },
    select: { clientId: true },
  });
  return [...new Set(subs.map((s) => s.clientId).filter((v): v is string => Boolean(v)))];
}
