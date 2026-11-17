/**
 * Importē kartotēku (prisma/belief-library.json) DB kā bibliotēku.
 * Idempotentisks - atkārtots palaišanas atjaunina saturu pēc libraryKey.
 *
 * Lietošana:
 *   npx tsx scripts/belief-library-import.ts            → DEV (.env.local)
 *   DATABASE_URL=... npx tsx scripts/belief-library-import.ts  → cita vide
 */
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const data = JSON.parse(readFileSync("prisma/belief-library.json", "utf-8"));

async function main() {
  let trunks = 0;
  let branches = 0;

  for (const theme of data.themes) {
    const t = await prisma.beliefLibraryTheme.upsert({
      where: { libraryKey: theme.libraryKey },
      create: {
        libraryKey: theme.libraryKey,
        sortOrder: theme.sortOrder,
        titleLv: theme.titleLv,
        titleEn: theme.titleEn,
        descriptionLv: theme.descriptionLv,
        exploreQuestions: theme.exploreQuestions,
        professionalNotes: theme.professionalNotes,
        isSensitive: theme.libraryKey === "10",
      },
      update: {
        sortOrder: theme.sortOrder,
        titleLv: theme.titleLv,
        titleEn: theme.titleEn,
        descriptionLv: theme.descriptionLv,
        exploreQuestions: theme.exploreQuestions,
        professionalNotes: theme.professionalNotes,
        isSensitive: theme.libraryKey === "10",
      },
    });

    for (const trunk of theme.trunks) {
      const tr = await prisma.beliefLibraryTrunk.upsert({
        where: { libraryKey: trunk.libraryKey },
        create: {
          libraryKey: trunk.libraryKey,
          themeId: t.id,
          sortOrder: trunk.sortOrder,
          titleLv: trunk.titleLv,
          titleEn: trunk.titleEn,
          negativeBelief: trunk.negativeBelief,
          status: "PUBLISHED",
        },
        update: {
          themeId: t.id,
          sortOrder: trunk.sortOrder,
          titleLv: trunk.titleLv,
          titleEn: trunk.titleEn,
          negativeBelief: trunk.negativeBelief,
        },
      });
      trunks++;

      // zari - vienkārša nomaiņa pēc trunkId (bibliotēkas saturs, fiksēts)
      await prisma.beliefLibraryBranch.deleteMany({ where: { trunkId: tr.id } });
      for (const b of trunk.branches) {
        await prisma.beliefLibraryBranch.create({
          data: { trunkId: tr.id, sortOrder: b.sortOrder, textLv: b.textLv, textEn: b.textEn },
        });
        branches++;
      }
    }
  }

  const counts = {
    themes: await prisma.beliefLibraryTheme.count(),
    trunks: await prisma.beliefLibraryTrunk.count(),
    branches: await prisma.beliefLibraryBranch.count(),
  };
  console.log(`importēts: ${trunks} stumbri, ${branches} zari`);
  console.log("DB:", JSON.stringify(counts));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
