/**
 * Identity Test satura imports (idempotents).
 *
 * Avots: Identitates_tests_web_saturs_un_izstrades_specifikacija.docx →
 * prisma/identity-test-content.json (10 tēmas × 5 apakštēmas × 4 uzskati).
 *
 * Principi:
 * - Importē tikai dokumentā apstiprināto saturu — neizdomā fragmentus.
 * - Entītijas nonāk DRAFT statusā (administrators publicē).
 * - LV teksti no avota dokumenta → publishedValue + PUBLISHED tulkojuma statuss.
 * - EN tēmu nosaukumi no avota → PUBLISHED; viss pārējais EN → nav tulkots.
 * - 10. tēma: isSensitive + safetyFlags pēc apakštēmas.
 *
 * Palaišana: npx tsx prisma/identity-test-seed.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  PrismaClient,
  IdentityContentStatus,
  IdentityTranslationStatus,
  type IdentitySafetyFlag,
  type IdentityContentEntityType,
} from "@prisma/client";

const prisma = new PrismaClient();

type SeedSubcategory = {
  slug: string;
  nameLv: string;
  flags: IdentitySafetyFlag[];
  beliefs: string[];
};

type SeedTheme = {
  slug: string;
  nameLv: string;
  nameEn: string;
  isSensitive: boolean;
  subcats: SeedSubcategory[];
};

async function upsertTranslation(input: {
  entityType: IdentityContentEntityType;
  entityId: string;
  field: string;
  locale: string;
  value: string;
  status: IdentityTranslationStatus;
}) {
  await prisma.identityContentTranslation.upsert({
    where: {
      entityType_entityId_field_locale: {
        entityType: input.entityType,
        entityId: input.entityId,
        field: input.field,
        locale: input.locale,
      },
    },
    update: {}, // nekad nepārraksta jau rediģētu saturu
    create: {
      entityType: input.entityType,
      entityId: input.entityId,
      field: input.field,
      locale: input.locale,
      draftValue: input.value,
      publishedValue: input.value,
      translationStatus: input.status,
    },
  });
}

async function main() {
  const file = join(__dirname, "identity-test-content.json");
  const themes = JSON.parse(readFileSync(file, "utf8")) as SeedTheme[];

  let beliefCount = 0;
  for (const [ti, theme] of themes.entries()) {
    const themeRow = await prisma.identityTestTheme.upsert({
      where: { slug: theme.slug },
      update: { isSensitive: theme.isSensitive },
      create: {
        slug: theme.slug,
        sortOrder: ti,
        isSensitive: theme.isSensitive,
        status: IdentityContentStatus.DRAFT,
      },
    });
    await upsertTranslation({
      entityType: "THEME", entityId: themeRow.id, field: "name",
      locale: "lv", value: theme.nameLv, status: IdentityTranslationStatus.PUBLISHED,
    });
    await upsertTranslation({
      entityType: "THEME", entityId: themeRow.id, field: "name",
      locale: "en", value: theme.nameEn, status: IdentityTranslationStatus.PUBLISHED,
    });

    for (const [si, sub] of theme.subcats.entries()) {
      const subRow = await prisma.identityTestSubcategory.upsert({
        where: { themeId_slug: { themeId: themeRow.id, slug: sub.slug } },
        update: {},
        create: {
          themeId: themeRow.id,
          slug: sub.slug,
          sortOrder: si,
          status: IdentityContentStatus.DRAFT,
        },
      });
      await upsertTranslation({
        entityType: "SUBCATEGORY", entityId: subRow.id, field: "name",
        locale: "lv", value: sub.nameLv, status: IdentityTranslationStatus.PUBLISHED,
      });

      for (const [bi, beliefText] of sub.beliefs.entries()) {
        const stableKey = `T${String(ti + 1).padStart(2, "0")}-S${String(si + 1).padStart(2, "0")}-B${String(bi + 1).padStart(2, "0")}`;
        const belief = await prisma.identityBelief.upsert({
          where: { stableKey },
          update: { safetyFlags: sub.flags },
          create: {
            stableKey,
            subcategoryId: subRow.id,
            sortOrder: bi,
            safetyFlags: sub.flags,
            status: IdentityContentStatus.DRAFT,
          },
        });
        await upsertTranslation({
          entityType: "BELIEF", entityId: belief.id, field: "text",
          locale: "lv", value: beliefText, status: IdentityTranslationStatus.PUBLISHED,
        });
        beliefCount += 1;
      }
    }
  }

  // Mehānismu tagu vārdnīca no specifikācijas (uzskatiem tagus piesaista administrators).
  const mechanismTags: { key: string; lv: string }[] = [
    { key: "external-validation", lv: "Ārējs apstiprinājums" },
    { key: "intimacy-avoidance", lv: "Izvairīšanās no tuvības" },
    { key: "control", lv: "Kontrole" },
    { key: "perfectionism", lv: "Perfekcionisms" },
    { key: "self-blame", lv: "Pašpārmetumi" },
    { key: "over-responsibility", lv: "Pārmērīga atbildība" },
    { key: "scarcity-expectation", lv: "Trūkuma gaidas" },
    { key: "helplessness", lv: "Bezspēcības izjūta" },
    { key: "avoidance", lv: "Izvairīšanās" },
    { key: "rejection-fear", lv: "Bailes no noraidījuma" },
  ];
  for (const [i, tag] of mechanismTags.entries()) {
    const row = await prisma.identityMechanismTag.upsert({
      where: { key: tag.key },
      update: {},
      create: { key: tag.key, sortOrder: i, status: IdentityContentStatus.DRAFT },
    });
    await upsertTranslation({
      entityType: "MECHANISM_TAG", entityId: row.id, field: "label",
      locale: "lv", value: tag.lv, status: IdentityTranslationStatus.PUBLISHED,
    });
  }

  // E-pastu veidņu skelets — saturu aizpilda administrators.
  for (const step of ["RESULT", "DAY_1", "DAY_3", "DAY_5"] as const) {
    await prisma.identityEmailTemplate.upsert({
      where: { step },
      update: {},
      create: {
        step,
        delayDays: step === "DAY_1" ? 1 : step === "DAY_3" ? 3 : step === "DAY_5" ? 5 : 0,
        status: IdentityContentStatus.DRAFT,
      },
    });
  }

  console.log(
    `[identity-seed] themes=${themes.length} beliefs=${beliefCount} tags=${mechanismTags.length} emailTemplates=4`,
  );
}

main()
  .catch((error) => {
    console.error("[identity-seed] failed", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
