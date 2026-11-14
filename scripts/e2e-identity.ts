/**
 * Identity Test E2E pret lokālo dev DB.
 * Izveido minimālu publicētu fiksūru, tad izsauc processSubmission:
 * 1) veiksmīgs iesniegums, 2) tas pats requestId (idempotence),
 * 3) mārketinga piekrišana → secības ieraksts, 4) atteikšanās → secība CANCELLED.
 */
import { PrismaClient } from "@prisma/client";
import { processSubmission } from "../src/lib/identity-test/submit";
import { withdrawConsent } from "../src/lib/identity-test/sequence";
import { reserveDelivery, deliverEmail, claimDelivery } from "../src/lib/identity-test/delivery";

const prisma = new PrismaClient();
const LOCALE = "lv";

async function publishT(entityType: string, entityId: string, field: string, value: string) {
  await prisma.identityContentTranslation.upsert({
    where: { entityType_entityId_field_locale: { entityType: entityType as never, entityId, field, locale: LOCALE } },
    update: { draftValue: value, publishedValue: value, translationStatus: "PUBLISHED" },
    create: {
      entityType: entityType as never, entityId, field, locale: LOCALE,
      draftValue: value, publishedValue: value, translationStatus: "PUBLISHED",
    },
  });
}

const RUN_START = new Date();

async function main() {
  // Fiksūra: pirmie 2 uzskati (T01) + to struktūra PUBLISHED + portretu fragmenti.
  const beliefs = await prisma.identityBelief.findMany({
    where: { stableKey: { in: ["T01-S01-B01", "T01-S01-B02"] } },
    include: { subcategory: { include: { theme: true } } },
  });
  if (beliefs.length !== 2) throw new Error("fixture beliefs missing");

  for (const b of beliefs) {
    await prisma.identityTestTheme.update({ where: { id: b.subcategory.themeId }, data: { status: "PUBLISHED" } });
    await prisma.identityTestSubcategory.update({ where: { id: b.subcategoryId }, data: { status: "PUBLISHED" } });
    await prisma.identityBelief.update({
      where: { id: b.id },
      data: { status: "PUBLISHED", safetyFlags: [] },
    });
    await publishT("BELIEF", b.id, "portraitNow", `Šodienas portrets par ${b.stableKey}.`);
    await publishT("BELIEF", b.id, "portraitFuture", `Nākotnes portrets par ${b.stableKey}.`);
    // text jau ir publicēts no seed; drošības labad nodrošinām:
    const existing = await prisma.identityContentTranslation.findUnique({
      where: { entityType_entityId_field_locale: { entityType: "BELIEF", entityId: b.id, field: "text", locale: LOCALE } },
    });
    if (existing && !existing.publishedValue) {
      await publishT("BELIEF", b.id, "text", existing.draftValue);
    }
  }
  // Tēmas/apakštēmas nosaukumi (nav kritiski validācijai, bet der publiskajai lapai).
  const theme = beliefs[0].subcategory.theme;
  await publishT("THEME", theme.id, "name", "Testa tēma");
  await publishT("SUBCATEGORY", beliefs[0].subcategoryId, "name", "Testa apakštēma");

  // Savienotājfrāzes
  const connDefs: [string, string, string][] = [
    ["opening", "OPENING", "Tavs portrets šodien:"],
    ["join-similar", "JOIN_SIMILAR", "Šie uzskati darbojas kopā:"],
    ["join-contrast", "JOIN_CONTRAST", "Savukārt"],
    ["transition", "TRANSITION", "Un ja šie uzskati vairs nevadītu tavas izvēles:"],
    ["closing", "CLOSING", "Šis ir tikai atspoguļojums."],
    ["closing-future", "CLOSING", "Nākotne nav noteikta."],
  ];
  for (const [key, kind, text] of connDefs) {
    const c = await prisma.identityConnector.upsert({
      where: { key }, update: { status: "PUBLISHED" }, create: { key, kind: kind as never, status: "PUBLISHED" },
    });
    await publishT("CONNECTOR", c.id, "text", text);
  }

  // Drošības bloks (singleton)
  await publishT("SAFETY_TEXT", "crisis-block", "body", "Ja tev draud briesmas - zvani 112 vai 113.");

  // RESULT e-pasta veidne
  const tpl = await prisma.identityEmailTemplate.upsert({
    where: { step: "RESULT" }, update: { status: "PUBLISHED" }, create: { step: "RESULT", status: "PUBLISHED" },
  });
  for (const [f, v] of Object.entries({
    subject: "Tavs Identitātes Testa rezultāts",
    greeting: "Sveiki,",
    intro: "Šeit ir tavi portreti.",
    nowTitle: "Portrets šodien",
    futureTitle: "Portrets nākotnē",
    disclaimer: "Tas nav psiholoģisks slēdziens.",
    sessionLead: "Ja vēlies strādāt individuāli:",
    sessionCta: "Rezervēt sesiju",
    privacyNote: "Tavi dati ir drošībā.",
  })) {
    await publishT("EMAIL_TEMPLATE", tpl.id, f, v);
  }
  console.log("✓ fixture published");

  // 1) Veiksmīgs iesniegums
  const reqId = crypto.randomUUID();
  const r1 = await processSubmission({
    requestId: reqId, email: "e2e@test.lv", locale: LOCALE,
    beliefIds: beliefs.map((b) => b.id), marketingConsent: true,
  });
  console.log("submit#1:", JSON.stringify(r1));

  // 2) Tas pats requestId → jāatgriež esošais submission bez dubultošanas
  const r2 = await processSubmission({
    requestId: reqId, email: "e2e@test.lv", locale: LOCALE,
    beliefIds: beliefs.map((b) => b.id), marketingConsent: true,
  });
  console.log("submit#2 (same requestId):", JSON.stringify(r2));
  // Bez RESEND_API_KEY piegāde neizdodas - e2e pārbauda idempotenci un stāvokļus.
  if (!r1.submissionId || r1.submissionId !== r2.submissionId) throw new Error("idempotency failed");
  const subCount = await prisma.identityTestSubmission.count({ where: { requestId: reqId } });
  if (subCount !== 1) throw new Error("duplicate submission created");
  const resultCount = await prisma.identityTestResult.count({
    where: { submissionId: r1.submissionId },
  });
  if (resultCount !== 1) throw new Error("duplicate result created");

  // 3) Rezultāts, piegāde, secība
  const sub = await prisma.identityTestSubmission.findUnique({
    where: { requestId: reqId },
    include: { result: true, deliveries: true, sequences: true },
  });
  // Šifrēšanas pārbaude - email/portreti nedrīkst būt plaintext.
  if (sub?.result && (sub.result.email.includes("@") || sub.result.portraitNow.includes("portrets"))) {
    throw new Error("plaintext leak in result fields");
  }
  const stuckProcessing = await prisma.identityEmailDelivery.count({
    where: { status: "PROCESSING", createdAt: { gte: RUN_START } },
  });
  if (stuckProcessing > 0) throw new Error("delivery stuck in PROCESSING");
  console.log("submission:", sub?.status, "| deliveries:", sub?.deliveries.map((d) => `${d.emailKind}:${d.status}:${d.lastError ?? ""}`).join(","), "| sequences:", sub?.sequences.map((s) => `${s.status}:${s.nextStep}`).join(","));

  // 4) Atteikšanās no mārketinga → secība jāatceļ
  const consent = await prisma.identityEmailConsent.findFirst({ where: { submissionId: r1.submissionId } });
  if (consent) {
    await withdrawConsent(consent.id);
    const seqAfter = await prisma.identityEmailSequence.findFirst({ where: { submissionId: r1.submissionId } });
    console.log("sequence after unsubscribe:", seqAfter?.status);
    if (seqAfter?.status !== "CANCELLED") throw new Error("unsubscribe did not cancel sequence");
  }

  // 4b) KRĪZES scenārijs: safetyTriggered uzskats + marketingConsent=true
  // → secība NEVEIDOJAS, consent.marketingConsent=false, rezultāta e-pasts tomēr mēģināts.
  const crisisBelief = beliefs[0];
  await prisma.identityBelief.update({
    where: { id: crisisBelief.id },
    data: { safetyFlags: ["CRISIS"] },
  });
  const reqCrisis = crypto.randomUUID();
  const rc = await processSubmission({
    requestId: reqCrisis, email: "crisis@test.lv", locale: LOCALE,
    beliefIds: [crisisBelief.id], marketingConsent: true,
  });
  const crisisSub = await prisma.identityTestSubmission.findUnique({
    where: { requestId: reqCrisis },
    include: { sequences: true, consents: true },
  });
  console.log("crisis submit:", JSON.stringify(rc), "| safetyTriggered:", crisisSub?.safetyTriggered,
    "| sequences:", crisisSub?.sequences.length, "| consentConsent:", crisisSub?.consents[0]?.marketingConsent);
  if (crisisSub?.safetyTriggered !== true) throw new Error("crisis flag missing");
  if (crisisSub && crisisSub.sequences.length > 0) throw new Error("crisis sequence must not be created");
  if (crisisSub?.consents[0]?.marketingConsent !== false) throw new Error("crisis marketing consent must be false");

  // 4c) Defense-in-depth: manuāli izveidota ACTIVE secība krīzes submission → cron atceļ.
  const consentRow = crisisSub!.consents[0];
  await prisma.identityEmailConsent.update({
    where: { id: consentRow.id }, data: { marketingConsent: true }, // simulējam bojātu stāvokli
  });
  await prisma.identityEmailSequence.create({
    data: {
      submissionId: crisisSub!.id, consentId: consentRow.id,
      email: consentRow.email, emailHash: consentRow.emailHash,
      nextStep: "DAY_1", nextSendAt: new Date(Date.now() - 1000),
    },
  });
  const { processDueSequences } = await import("../src/lib/identity-test/sequence");
  await processDueSequences();
  const seqCrisis = await prisma.identityEmailSequence.findFirst({ where: { submissionId: crisisSub!.id } });
  console.log("crisis sequence after cron:", seqCrisis?.status);
  if (seqCrisis?.status !== "CANCELLED") throw new Error("crisis sequence was not cancelled by cron");

  // 4d) Piegādes idempotence/retry/ambiguous (mokēts send - Resend nav vajadzīgs).
  const mockOk = async () => ({ ok: true as const, id: "msg_test_1" });
  const mockFail = async () => ({ ok: false as const, reason: "resend_timeout" });
  const mockFailSkip = async () => ({ ok: false as const, skipped: true as const, reason: "not_configured" });

  // 1) Veiksmīga piegāde → SENT; atkārtots deliverEmail → already_sent.
  const d1 = await reserveDelivery({
    requestId: `e2e:${crypto.randomUUID()}`, recipient: "d1@test.lv",
    emailKind: "RESULT", step: "RESULT",
  });
  const o1 = await deliverEmail(d1.row!.id, { subject: "s", html: "h", text: "t" }, undefined, mockOk);
  const o1b = await deliverEmail(d1.row!.id, { subject: "s", html: "h", text: "t" }, undefined, mockOk);
  const d1row = await prisma.identityEmailDelivery.findUnique({ where: { id: d1.row!.id } });
  console.log("delivery ok:", o1.ok, "| resend:", o1b.ok ? "?" : o1b.reason, "| status:", d1row?.status, "| provider:", d1row?.providerMessageId);
  if (!o1.ok || o1b.ok || d1row?.status !== "SENT") throw new Error("delivery idempotency failed");

  // 2) requestId P2002 rezervācija → atgriež to pašu rindu.
  const d1again = await reserveDelivery({
    requestId: d1.row!.requestId, recipient: "d1@test.lv",
    emailKind: "RESULT", step: "RESULT",
  });
  if (d1again.created || d1again.row?.id !== d1.row!.id) throw new Error("reserve dedupe failed");

  // 3) Timeout/ambiguous: ok:false bez skipped → PENDING ar nextRetryAt (konservatīvi, bez dubulta).
  const d2 = await reserveDelivery({
    requestId: `e2e:${crypto.randomUUID()}`, recipient: "d2@test.lv",
    emailKind: "RESULT", step: "RESULT",
  });
  const o2 = await deliverEmail(d2.row!.id, { subject: "s", html: "h", text: "t" }, undefined, mockFail);
  const d2row = await prisma.identityEmailDelivery.findUnique({ where: { id: d2.row!.id } });
  console.log("ambiguous:", JSON.stringify(o2), "| status:", d2row?.status, "| retryAt set:", Boolean(d2row?.nextRetryAt), "| attempts:", d2row?.attemptCount);
  if (o2.ok || d2row?.status !== "PENDING" || !d2row.nextRetryAt) throw new Error("ambiguous handling failed");

  // 4) Claim ekskluzivitāte: PROCESSING stāvoklī otrs claim neizdodas.
  const claim1 = await claimDelivery(d2.row!.id); // PENDING→PROCESSING
  const claim2 = await claimDelivery(d2.row!.id); // jau PROCESSING → false
  console.log("claims:", claim1, claim2);
  if (!claim1 || claim2) throw new Error("claim exclusivity failed");

  // 5) skipped (nav konfigurēts) → FAILED bez retry.
  const d3 = await reserveDelivery({
    requestId: `e2e:${crypto.randomUUID()}`, recipient: "d3@test.lv",
    emailKind: "RESULT", step: "RESULT",
  });
  const o3 = await deliverEmail(d3.row!.id, { subject: "s", html: "h", text: "t" }, undefined, mockFailSkip);
  const d3row = await prisma.identityEmailDelivery.findUnique({ where: { id: d3.row!.id } });
  console.log("skipped send:", JSON.stringify(o3), "| status:", d3row?.status);
  if (d3row?.status !== "FAILED") throw new Error("skipped handling failed");

  // 5) Noraidīts iesniegums (nepublicēts uzskats)
  const draftBelief = await prisma.identityBelief.findFirst({ where: { status: "DRAFT" } });
  const r3 = await processSubmission({
    requestId: crypto.randomUUID(), email: "e2e@test.lv", locale: LOCALE,
    beliefIds: [draftBelief!.id], marketingConsent: false,
  });
  console.log("submit#3 (draft belief):", JSON.stringify(r3));
  if (r3.ok) throw new Error("draft belief should be rejected");

  console.log("✓ E2E OK");
}
main().catch((e) => { console.error("E2E FAIL:", e); process.exit(1); }).finally(() => prisma.$disconnect());
