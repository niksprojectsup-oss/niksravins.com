import { prisma } from "@/lib/db/prisma";
import { decryptField, encryptField } from "@/lib/security/encryption";
import { composePortraits } from "./compose";
import { resolveFieldValue } from "./content";
import { deliverEmail, reserveDelivery } from "./delivery";
import { emailHash, normalizeEmail } from "./hash";
import {
  buildSnapshot,
  loadBeliefsForGeneration,
  loadConnectors,
  loadConsentText,
  loadSafetyBlock,
} from "./repository";
import { buildResultEmail, buildEmailThemeSections } from "./email-templates";
import { validateBeliefSelection, validateSubmitPayload } from "./validate";
import { LOCALES } from "@/lib/i18n/config";
import { getAppBaseUrl } from "@/lib/url";
import type { GenerationSnapshot, SubmitPayload, SubmitResult } from "./types";

const RESULT_TEXT_FIELDS = [
  "subject", "greeting", "intro", "nowTitle", "futureTitle",
  "disclaimer", "sessionLead", "sessionCta", "privacyNote",
] as const;

async function resolveResultTemplate(step: "RESULT", locale: string) {
  const template = await prisma.identityEmailTemplate.findUnique({ where: { step } });
  if (!template || template.status !== "PUBLISHED") return null;

  const values: Record<string, string> = {};
  for (const field of RESULT_TEXT_FIELDS) {
    const value = await resolveFieldValue({
      entityType: "EMAIL_TEMPLATE", entityId: template.id, field, locale,
    });
    if (value) values[field] = value;
  }
  if (!values.subject) return null;
  return { template, values };
}

export async function processSubmission(payload: SubmitPayload): Promise<SubmitResult> {
  const payloadCheck = validateSubmitPayload({
    requestId: payload.requestId,
    email: payload.email,
    locale: payload.locale,
    beliefIds: payload.beliefIds,
    allowedLocales: LOCALES,
  });
  if (!payloadCheck.ok) {
    return { ok: false, reason: "invalid", message: payloadCheck.message };
  }

  const email = normalizeEmail(payload.email);

  // Idempotence: requestId unikāls - dubultklikšķis atgriež esošo submission.
  let submission;
  try {
    submission = await prisma.identityTestSubmission.create({
      data: {
        selectedBeliefIds: payload.beliefIds,
        locale: payload.locale,
        requestId: payload.requestId,
      },
    });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      const existing = await prisma.identityTestSubmission.findUnique({
        where: { requestId: payload.requestId },
      });
      if (existing) return { ok: true, submissionId: existing.id };
    }
    throw error;
  }

  const beliefCheck = await validateBeliefSelection(payload.beliefIds, payload.locale);
  if (!beliefCheck.ok) {
    await prisma.identityTestSubmission.update({
      where: { id: submission.id },
      data: { status: "REJECTED", validationNote: beliefCheck.message },
    });
    return { ok: false, reason: "validation", message: beliefCheck.message };
  }
  await prisma.identityTestSubmission.update({
    where: { id: submission.id }, data: { status: "VALIDATED" },
  });

  const [beliefs, { texts: connectors, snapshot: connectorSnapshot }, safetyBlock, consentText] =
    await Promise.all([
      loadBeliefsForGeneration(payload.beliefIds, payload.locale),
      loadConnectors(payload.locale),
      loadSafetyBlock(payload.locale),
      loadConsentText(payload.locale),
    ]);

  const { portraitNow, portraitFuture, safetyTriggered } = composePortraits({
    beliefs,
    connectors,
  });

  // Tēmu portreti no apstiprinātajiem portrait fragmentiem - saglabājas
  // snapshotā, lai atkārtotā sūtīšana atgrieztu identisku saturu.
  const emailThemes = buildEmailThemeSections(
    beliefs.map((b) => ({
      themeName: b.themeName,
      portraitNow: b.portraitNow,
      portraitFuture: b.portraitFuture,
    })),
  );
  for (const b of beliefs) {
    if (!b.portraitNow || !b.portraitFuture) {
      console.warn("[identity] missing portrait fragment", { beliefId: b.id, stableKey: b.stableKey });
    }
  }

  const snapshot = buildSnapshot({
    locale: payload.locale,
    beliefs,
    connectors: connectorSnapshot,
    safetyBlock: safetyBlock ?? undefined,
    sourceVersions: [1],
    emailThemes,
  });

  const [result] = await prisma.$transaction([
    prisma.identityTestResult.create({
      data: {
        submissionId: submission.id,
        email: encryptField(email),
        emailHash: emailHash(email),
        portraitNow: encryptField(portraitNow),
        portraitFuture: encryptField(portraitFuture),
        contentVersion: snapshot.contentVersion,
        snapshot: snapshot as object,
        locale: payload.locale,
      },
    }),
    // safetyTriggered saglabājam uzreiz - neatkarīgi no tālākā e-pasta iznākuma,
    // lai krīzes karogs vienmēr būt pieejams secību/drošības loģikai.
    prisma.identityTestSubmission.update({
      where: { id: submission.id },
      data: { safetyTriggered },
    }),
  ]);

  // Krīzes aizsardzība: safetyTriggered rezultāti nekad nekļūst par mārketinga
  // segmentu - mārketinga piekrišana netiek reģistrēta un secība netiek veidota.
  // Rezultāta e-pasts (ar drošības bloku) tiek sūtīts neatkarīgi no piekrišanas.
  const marketingAllowed = payload.marketingConsent && !safetyTriggered;
  const consent = await prisma.identityEmailConsent.create({
    data: {
      submissionId: submission.id,
      email: encryptField(email),
      emailHash: emailHash(email),
      marketingConsent: marketingAllowed,
      consentTextVersion: consentText ? `v${consentText.sourceVersion}` : "v0",
    },
  });

  // Automātiskā sasaiste ar esošu klienta profilu (ja Client ar šo e-pastu
  // jau pastāv). Nedrīkst ietekmēt rezultāta/e-pasta plūsmu - tikai
  // labākās pūles piesaiste ar esošo verificēto loģiku.
  try {
    const { linkSubmissionForMatchingClient } = await import("@/lib/development/linking");
    const linked = await linkSubmissionForMatchingClient(email);
    if (linked.clientId && (linked.linked > 0 || linked.review > 0)) {
      console.info("[identity] submission client link", {
        submissionId: submission.id,
        linked: linked.linked,
        review: linked.review,
      });
    }
  } catch (linkError) {
    console.error("[identity] submission client link failed", linkError);
  }

  if (marketingAllowed) {
    const day1 = await prisma.identityEmailTemplate.findUnique({ where: { step: "DAY_1" } });
    await prisma.identityEmailSequence.create({
      data: {
        submissionId: submission.id,
        consentId: consent.id,
        email: encryptField(email),
        emailHash: emailHash(email),
        nextStep: "DAY_1",
        nextSendAt: new Date(Date.now() + (day1?.delayDays ?? 1) * 24 * 60 * 60 * 1000),
      },
    });
  }

  const resolved = await resolveResultTemplate("RESULT", payload.locale);
  if (!resolved) {
    await prisma.identityEmailDelivery.create({
      data: {
        requestId: `result:${result.id}`,
        resultId: result.id,
        submissionId: submission.id,
        recipient: encryptField(email),
        recipientHash: emailHash(email),
        emailKind: "RESULT",
        step: "RESULT",
        status: "FAILED",
        lastError: "template_unpublished",
      },
    });
    return { ok: false, reason: "email_failed", message: "template_unpublished" };
  }

  const bookingPath = payload.locale === "en" ? "/book" : `/${payload.locale}/book`;
  const bookingUrl = `${getAppBaseUrl()}${bookingPath}`;
  const emailContent = buildResultEmail({
    locale: payload.locale,
    portraitNow,
    portraitFuture,
    bookingUrl,
    hideBookingCta: payload.locale === "lv",
    themes: emailThemes,
    texts: {
      greeting: resolved.values.greeting ?? "",
      intro: resolved.values.intro ?? "",
      nowTitle: resolved.values.nowTitle ?? "",
      futureTitle: resolved.values.futureTitle ?? "",
      disclaimer: resolved.values.disclaimer ?? "",
      sessionLead: resolved.values.sessionLead ?? "",
      sessionCta: resolved.values.sessionCta ?? "",
      privacyNote: resolved.values.privacyNote ?? "",
    },
  });

  const reserved = await reserveDelivery({
    requestId: `result:${result.id}`,
    recipient: email,
    emailKind: "RESULT",
    resultId: result.id,
    submissionId: submission.id,
    step: "RESULT",
  });
  if (!reserved.row) throw new Error("delivery_reservation_failed");

  const outcome = await deliverEmail(reserved.row.id, {
    subject: resolved.values.subject,
    html: emailContent.html,
    text: emailContent.text,
  }, { kind: "identity-test-result", context: { submissionId: submission.id } });

  if (!outcome.ok && outcome.reason !== "already_sent") {
    return { ok: false, reason: "email_failed", message: outcome.error, submissionId: submission.id };
  }

  await prisma.identityTestSubmission.update({
    where: { id: submission.id },
    data: { status: "RESULT_GENERATED" },
  });

  return { ok: true, submissionId: submission.id };
}

/** Admin atkārtotai rezultāta sūtīšanai / lietotāja retry - atšifrē saglabātos portretus. */
export async function resendResultEmail(resultId: string): Promise<SubmitResult> {
  const result = await prisma.identityTestResult.findUnique({
    where: { id: resultId },
    include: { submission: true },
  });
  if (!result) return { ok: false, reason: "invalid", message: "result_not_found" };

  const resolved = await resolveResultTemplate("RESULT", result.locale);
  if (!resolved) return { ok: false, reason: "email_failed", message: "template_unpublished" };

  const email = decryptField(result.email);
  const portraitNow = decryptField(result.portraitNow);
  const portraitFuture = decryptField(result.portraitFuture);
  const bookingPath = result.locale === "en" ? "/book" : `/${result.locale}/book`;
  // Tēmu pārskats: jaunajiem rezultātiem no snapshot (identiski oriģinālam);
  // vecajiem bez emailThemes - atjaunojam no snapshot saglabātajiem
  // portretu fragmentiem (nekādas dzīvās vaicājumu atkarības).
  const snapshot = result.snapshot as GenerationSnapshot | null;
  const snapshotBeliefs = snapshot?.beliefs ?? [];
  const emailContent = buildResultEmail({
    locale: result.locale,
    portraitNow,
    portraitFuture,
    bookingUrl: `${getAppBaseUrl()}${bookingPath}`,
    hideBookingCta: result.locale === "lv",
    themes:
      snapshot?.emailThemes ??
      (snapshotBeliefs.length
        ? buildEmailThemeSections(
            snapshotBeliefs.map((b) => ({
              themeName: b.theme.name,
              portraitNow: b.portraitNow,
              portraitFuture: b.portraitFuture,
            })),
          )
        : undefined),
    texts: {
      greeting: resolved.values.greeting ?? "",
      intro: resolved.values.intro ?? "",
      nowTitle: resolved.values.nowTitle ?? "",
      futureTitle: resolved.values.futureTitle ?? "",
      disclaimer: resolved.values.disclaimer ?? "",
      sessionLead: resolved.values.sessionLead ?? "",
      sessionCta: resolved.values.sessionCta ?? "",
      privacyNote: resolved.values.privacyNote ?? "",
    },
  });

  const reserved = await reserveDelivery({
    requestId: `result:${result.id}`,
    recipient: email,
    emailKind: "RESULT",
    resultId: result.id,
    submissionId: result.submissionId,
    step: "RESULT",
  });
  if (!reserved.row) return { ok: false, reason: "email_failed", message: "reservation_failed" };

  // Ja jau SENT - admin atkārtotai sūtīšanai atļauj jaunu piegādi ar atvasinātu requestId.
  if (reserved.row.status === "SENT") {
    const retry = await reserveDelivery({
      requestId: `result:${result.id}:retry:${Date.now()}`,
      recipient: email,
      emailKind: "RESULT",
      resultId: result.id,
      submissionId: result.submissionId,
      step: "RESULT",
    });
    if (!retry.row) return { ok: false, reason: "email_failed", message: "reservation_failed" };
    const outcome = await deliverEmail(retry.row.id, {
      subject: resolved.values.subject, html: emailContent.html, text: emailContent.text,
    }, { kind: "identity-test-result-resend", context: { resultId } });
    return outcome.ok ? { ok: true, submissionId: result.submissionId } : { ok: false, reason: "email_failed", message: outcome.error };
  }

  const outcome = await deliverEmail(reserved.row.id, {
    subject: resolved.values.subject, html: emailContent.html, text: emailContent.text,
  }, { kind: "identity-test-result-resend", context: { resultId } });
  return outcome.ok ? { ok: true, submissionId: result.submissionId } : { ok: false, reason: "email_failed", message: outcome.error };
}
