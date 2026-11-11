// Admin redaktora plūsmas pārbaude pret AKTĪVO DATABASE_URL (tikai DEV!).
// Izplata reālās servera darbības; requireAdmin/revalidatePath nomockoti,
// jo skripts darbojas ārpus HTTP konteksta.
import { mock } from "node:test";

const fakeSession = {
  id: "dev-admin-check-script",
  email: "dev-admin@identity-test.local",
  role: "ADMIN" as const,
  clientId: null,
  practitionerId: null,
  sessionId: "dev-admin-check",
  mfaVerified: true,
  mfaEnabled: false,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
mock.module("@/lib/auth/guards" as any, {
  namedExports: { requireAdmin: async () => fakeSession },
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
mock.module("next/cache" as any, {
  namedExports: { revalidatePath: () => undefined, revalidateTag: () => undefined },
});

async function main() {
  const { prisma } = await import("../src/lib/db/prisma");
  const admin = await prisma.adminUser.findUnique({ where: { email: fakeSession.email } });
  if (!admin) throw new Error("DEV admin user missing — run create-admin first");
  fakeSession.id = admin.id; // changedById FK prasa reālu AdminUser

  const { getPublicTestContent } = await import("../src/lib/identity-test/repository");
  const actions = await import("../src/lib/admin/actions/identity-test");

  const assert = (cond: unknown, msg: string) => {
    if (!cond) throw new Error(`FAIL: ${msg}`);
  };
  const auditBefore = await prisma.auditLog.count();
  // Atlikumu no iepriekšējā cikla tīrīšana
  const stale = await prisma.identityTestTheme.findFirst({ where: { slug: "ZZ-admin-check" } });
  if (stale) {
    const sids = (await prisma.identityTestSubcategory.findMany({ where: { themeId: stale.id } })).map((x) => x.id);
    const bids = (await prisma.identityBelief.findMany({ where: { subcategoryId: { in: sids } } })).map((x) => x.id);
    const ids = [stale.id, ...sids, ...bids];
    await prisma.identityContentVersion.deleteMany({ where: { entityId: { in: ids } } });
    await prisma.identityContentTranslation.deleteMany({ where: { entityId: { in: ids } } });
    await prisma.identityBelief.deleteMany({ where: { subcategoryId: { in: sids } } });
    await prisma.identityTestSubcategory.deleteMany({ where: { themeId: stale.id } });
    await prisma.identityTestTheme.delete({ where: { id: stale.id } });
  }

  // 1) Izveide: tēma → apakštēma → uzskats (viss DRAFT)
  const t = await actions.createThemeAction({ slug: "ZZ-admin-check" });
  assert(t.id, "theme create");
  const s = await actions.createSubcategoryAction(t.id!, { slug: "ZZ-admin-check-S01" });
  const b = await actions.createBeliefAction(s.id!);
  await actions.updateBeliefAction(b.id!, { stableKey: "ADMIN-CHECK-B01" });

  // 2) DRAFT netiek publiski parādīts
  let pub = await getPublicTestContent("lv");
  assert(!pub.themes.some((x) => x.slug === "ZZ-admin-check"), "DRAFT theme must be hidden");

  // 3) Saglabāšana kā melnraksts → joprojām nav publiski
  await actions.updateTranslationAction({
    entityType: "THEME", entityId: t.id!, field: "name", locale: "lv",
    draftValue: "Admin check tēma",
  });
  const draftRow = await prisma.identityContentTranslation.findFirst({
    where: { entityType: "THEME", entityId: t.id!, field: "name", locale: "lv" },
  });
  assert(draftRow?.translationStatus === "NEEDS_REVIEW", "draft status");
  assert(draftRow?.publishedValue === null, "draft not published");
  pub = await getPublicTestContent("lv");
  assert(!pub.themes.some((x) => x.slug === "ZZ-admin-check"), "draft translation must stay hidden");

  // 4) LV avota maiņa → pārējo valodu statusi NEEDS_REVIEW
  await actions.updateTranslationAction({
    entityType: "THEME", entityId: t.id!, field: "name", locale: "en",
    draftValue: "Admin check theme", publish: true,
  });
  await actions.updateTranslationAction({
    entityType: "THEME", entityId: t.id!, field: "name", locale: "lv",
    draftValue: "Admin check tēma v2", publish: true,
  });
  const enRow = await prisma.identityContentTranslation.findFirst({
    where: { entityType: "THEME", entityId: t.id!, field: "name", locale: "en" },
  });
  assert(enRow?.translationStatus === "NEEDS_REVIEW", "en must flip to NEEDS_REVIEW after lv source edit");

  // 5) Publicēšana: tulkojumi + entītiju statusi
  const tr = await prisma.identityContentTranslation.findFirst({
    where: { entityType: "THEME", entityId: t.id!, field: "name", locale: "lv" },
  });
  await actions.approveTranslationAction(tr!.id);
  await actions.updateTranslationAction({
    entityType: "SUBCATEGORY", entityId: s.id!, field: "name", locale: "lv",
    draftValue: "Admin check apakštēma", publish: true,
  });
  await actions.updateTranslationAction({
    entityType: "BELIEF", entityId: b.id!, field: "text", locale: "lv",
    draftValue: "Admin check uzskats", publish: true,
  });
  await actions.updateThemeAction(t.id!, { status: "PUBLISHED" });
  await actions.updateSubcategoryAction(s.id!, { status: "PUBLISHED" });
  await actions.updateBeliefAction(b.id!, { status: "PUBLISHED" });

  // 6) Pēc publicēšanas redzams publiski
  pub = await getPublicTestContent("lv");
  const theme = pub.themes.find((x) => x.slug === "ZZ-admin-check");
  assert(theme, "published theme must be visible");
  assert(
    pub.beliefs.some((x) => x.stableKey === "ADMIN-CHECK-B01" && x.text === "Admin check uzskats"),
    "published belief text visible",
  );

  // 7) Versiju vēsture + audits
  const versions = await prisma.identityContentVersion.count({
    where: { entityId: { in: [t.id!, s.id!, b.id!] } },
  });
  assert(versions >= 3, `version history rows: ${versions}`);
  const auditAfter = await prisma.auditLog.count();
  assert(auditAfter > auditBefore, `audit rows +${auditAfter - auditBefore}`);

  // 8) Publicēts → atpakaļ uz DRAFT → pazūd publiski
  await actions.updateThemeAction(t.id!, { status: "DRAFT" });
  pub = await getPublicTestContent("lv");
  assert(!pub.themes.some((x) => x.slug === "ZZ-admin-check"), "unpublished theme hidden again");

  // 9) Cleanup (DEV): testa entītijas dzēstas; audita ieraksti paliek
  await prisma.identityContentVersion.deleteMany({ where: { entityId: { in: [t.id!, s.id!, b.id!] } } });
  await prisma.identityContentTranslation.deleteMany({ where: { entityId: { in: [t.id!, s.id!, b.id!] } } });
  await prisma.identityBelief.delete({ where: { id: b.id! } });
  await prisma.identityTestSubcategory.delete({ where: { id: s.id! } });
  await prisma.identityTestTheme.delete({ where: { id: t.id! } });
  await prisma.$disconnect();
  console.log("✓ admin-check OK (create→draft→save→publish→unpublish→audit→versions)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
