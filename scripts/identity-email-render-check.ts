/** Renderē Identity Test RESULT e-pastu (LV+EN, arī CRISIS) bez sūtīšanas un
 * pārbauda, ka tajā nav krīzes paziņojuma, AAP vai "Online worldwide".
 * Palaišana: npx tsx scripts/identity-email-render-check.ts */
import { prisma } from "../src/lib/db/prisma";
import { composePortraits } from "../src/lib/identity-test/compose";
import { buildResultEmail } from "../src/lib/identity-test/email-templates";
import { loadBeliefsForGeneration, loadConnectors } from "../src/lib/identity-test/repository";
import { resolveFieldValue } from "../src/lib/identity-test/content";

import { getAppBaseUrl } from "../src/lib/url";

const FORBIDDEN = ["112", "113", "paškaitējum", "self-harm", "Adaptive Association", "AAP", "Online worldwide", "worldwide"];

async function check(locale: string, keys: string[]) {
  const rows = await prisma.identityBelief.findMany({ where: { stableKey: { in: keys } }, select: { id: true } });
  const beliefs = await loadBeliefsForGeneration(rows.map((r) => r.id), locale);
  const { texts: connectors } = await loadConnectors(locale);
  const { portraitNow, portraitFuture, safetyTriggered } = composePortraits({ beliefs, connectors });
  const template = await prisma.identityEmailTemplate.findUnique({ where: { step: "RESULT" } });
  if (!template) throw new Error("template missing " + locale);
  const values: Record<string, string> = {};
  for (const f of ["subject","greeting","intro","nowTitle","futureTitle","disclaimer","sessionLead","sessionCta","privacyNote"]) {
    const v = await resolveFieldValue({ entityType: "EMAIL_TEMPLATE", entityId: template.id, field: f, locale });
    if (v) values[f] = v;
  }
  const resolved = { values };
  const email = buildResultEmail({
    locale, portraitNow, portraitFuture,
    bookingUrl: `${getAppBaseUrl()}/book`,
    hideBookingCta: locale === "lv",
    texts: {
      greeting: resolved.values.greeting ?? "", intro: resolved.values.intro ?? "",
      nowTitle: resolved.values.nowTitle ?? "", futureTitle: resolved.values.futureTitle ?? "",
      disclaimer: resolved.values.disclaimer ?? "", sessionLead: resolved.values.sessionLead ?? "",
      sessionCta: resolved.values.sessionCta ?? "", privacyNote: resolved.values.privacyNote ?? "",
    },
  });
  const hits = FORBIDDEN.filter((f) => email.html.includes(f) || email.text.includes(f));
  console.log(`--- ${locale} (safetyTriggered=${safetyTriggered}) ---`);
  console.log("forbidden hits:", hits.length ? hits : "NONE");
  console.log("html has crisis block:", /112|113|paškaitējum|self-harm/.test(email.html));
  console.log("text tail:", email.text.slice(-220).replace(/\n/g, " | "));
}

async function main() {
  // parasts komplekts + komplekts ar CRISIS karogu (ja tāds uzskats ir DEV)
  await check("lv", ["T01-S01-B01", "T05-S01-B03", "T07-S05-B02"]);
  await check("en", ["T01-S01-B01", "T05-S01-B03", "T07-S05-B02"]);
  const crisis = await prisma.identityBelief.findFirst({ where: { safetyFlags: { has: "CRISIS" } }, select: { stableKey: true } });
  console.log("crisis-flagged belief:", crisis?.stableKey ?? "none in DEV");
  if (crisis) {
    await check("lv", [crisis.stableKey]);
    await check("en", [crisis.stableKey]);
  }
}
main().finally(() => prisma.$disconnect());
