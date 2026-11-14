/** Kontrolēts RESULT e-pasta tests - pilnais pipeline (compose + buildResultEmail +
 * reserveDelivery + deliverEmail), subject ar [TEST] prefiksu.
 * Palaišana: npx tsx --env-file=.env.local scripts/identity-test-send-result.ts <locale> <adrese> */
import { prisma } from "../src/lib/db/prisma";
import { getEmailConfig } from "../src/lib/email/config";
import { composePortraits } from "../src/lib/identity-test/compose";
import { resolveFieldValue } from "../src/lib/identity-test/content";
import { deliverEmail, reserveDelivery } from "../src/lib/identity-test/delivery";
import { buildResultEmail } from "../src/lib/identity-test/email-templates";
import {
  loadBeliefsForGeneration,
  loadConnectors,
} from "../src/lib/identity-test/repository";
import { getAppBaseUrl } from "../src/lib/url";
import { randomUUID } from "node:crypto";

const RESULT_TEXT_FIELDS = [
  "subject", "greeting", "intro", "nowTitle", "futureTitle",
  "disclaimer", "sessionLead", "sessionCta", "privacyNote",
] as const;

async function main() {
  const locale = process.argv[2];
  const recipient = process.argv[3]?.trim();
  if (!["lv", "en"].includes(locale ?? "")) throw new Error("locale: lv|en");
  if (!recipient) throw new Error("recipient missing");

  const cfg = getEmailConfig();
  if (!cfg.isConfigured) throw new Error(`missing: ${cfg.missingVariables.join(",")}`);
  if (cfg.from !== "Niks Ravins <hello@niksravins.com>") {
    throw new Error(`EMAIL_FROM mismatch: ${cfg.from}`);
  }

  // Īsti uzskatu id no DEV DB - 3 apgalvojumi no vienas apakštēmas (klasteris)
  const beliefs = await prisma.identityBelief.findMany({
    where: { status: "PUBLISHED", stableKey: { in: ["T01-S01-B01", "T01-S01-B02", "T01-S04-B01", "T02-S03-B01"] } },
    select: { id: true, stableKey: true },
    orderBy: { stableKey: "asc" },
  });
  if (beliefs.length !== 4) throw new Error(`expected 4 beliefs, got ${beliefs.length}`);

  const [resolved, { texts: connectors }] = await Promise.all([
    loadBeliefsForGeneration(beliefs.map((b) => b.id), locale),
    loadConnectors(locale),
  ]);
  const { portraitNow, portraitFuture } = composePortraits({
    beliefs: resolved, connectors,
  });
  if (portraitNow.length < 100 || portraitFuture.length < 100) {
    throw new Error("portraits too short - content problem");
  }

  const template = await prisma.identityEmailTemplate.findUnique({ where: { step: "RESULT" } });
  if (!template || template.status !== "PUBLISHED") throw new Error("RESULT template not published");
  const values: Record<string, string> = {};
  for (const field of RESULT_TEXT_FIELDS) {
    const v = await resolveFieldValue({ entityType: "EMAIL_TEMPLATE", entityId: template.id, field, locale });
    if (v) values[field] = v;
  }
  if (!values.subject) throw new Error("RESULT subject missing for locale " + locale);

  const bookingPath = locale === "en" ? "/book" : `/${locale}/book`;
  const emailContent = buildResultEmail({
    locale, portraitNow, portraitFuture,
    bookingUrl: `${getAppBaseUrl()}${bookingPath}`,
    texts: {
      greeting: values.greeting ?? "", intro: values.intro ?? "",
      nowTitle: values.nowTitle ?? "", futureTitle: values.futureTitle ?? "",
      disclaimer: values.disclaimer ?? "", sessionLead: values.sessionLead ?? "",
      sessionCta: values.sessionCta ?? "", privacyNote: values.privacyNote ?? "",
    },
  });

  const reserved = await reserveDelivery({
    requestId: `test-result:${locale}:${randomUUID()}`,
    recipient,
    emailKind: "ADMIN_TEST",
    step: "RESULT",
  });
  if (!reserved.row) throw new Error("reservation failed");

  const outcome = await deliverEmail(reserved.row.id, {
    subject: `[TEST] ${values.subject}`,
    html: emailContent.html,
    text: emailContent.text,
  }, { kind: "identity-test-result", context: { test: "true", locale } });

  const row = await prisma.identityEmailDelivery.findUnique({ where: { id: reserved.row.id } });
  console.log(JSON.stringify({
    locale, ok: outcome.ok, status: row?.status,
    providerId: row?.providerMessageId, error: row?.lastError,
    portraitNowLen: portraitNow.length, portraitFutureLen: portraitFuture.length,
  }));
}
main().catch((e) => { console.error("FAIL:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
