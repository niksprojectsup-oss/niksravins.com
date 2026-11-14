import { prisma } from "@/lib/db/prisma";
import { decryptField } from "@/lib/security/encryption";
import { deliverEmail, reserveDelivery } from "./delivery";
import { resolveFieldValue } from "./content";
import { createUnsubscribeToken } from "./tokens";
import { buildSequenceEmail } from "./email-templates";
import { getAppBaseUrl } from "@/lib/url";
import type { IdentityEmailStep } from "@prisma/client";

const STEP_ORDER: IdentityEmailStep[] = ["DAY_1", "DAY_3", "DAY_5"];

function nextStepAfter(step: IdentityEmailStep): IdentityEmailStep | null {
  const index = STEP_ORDER.indexOf(step);
  return index >= 0 && index < STEP_ORDER.length - 1 ? STEP_ORDER[index + 1] : null;
}

/** Atomiska secības pretensija - pasargā no paralēlu cron izpildu dublēšanas. */
async function claimSequence(sequenceId: string): Promise<boolean> {
  const result = await prisma.identityEmailSequence.updateMany({
    where: { id: sequenceId, status: "ACTIVE", nextSendAt: { lte: new Date() } },
    data: { status: "PROCESSING", claimedAt: new Date() },
  });
  return result.count === 1;
}

async function resolveSequenceTemplate(step: IdentityEmailStep, locale: string) {
  const template = await prisma.identityEmailTemplate.findUnique({ where: { step } });
  if (!template || template.status !== "PUBLISHED") return null;
  const [subject, body] = await Promise.all([
    resolveFieldValue({ entityType: "EMAIL_TEMPLATE", entityId: template.id, field: "subject", locale }),
    resolveFieldValue({ entityType: "EMAIL_TEMPLATE", entityId: template.id, field: "body", locale }),
  ]);
  if (!subject || !body) return null;
  return { template, subject, body };
}

/**
 * Cron process: apstrādā termiņā esošās secības.
 * Katrs solis: claim → consent pārbaude (aktualizēta!) → template → delivery → solis tālāk.
 */
export async function processDueSequences(): Promise<{ processed: number; sent: number; cancelled: number; skipped: number }> {
  const due = await prisma.identityEmailSequence.findMany({
    where: { status: "ACTIVE", nextSendAt: { lte: new Date() } },
    take: 200,
  });

  let sent = 0;
  let cancelled = 0;
  let skipped = 0;

  for (const sequence of due) {
    if (!(await claimSequence(sequence.id))) {
      skipped += 1;
      continue;
    }

    // Aktuālā piekrišanas pārbaude servera pusē - unsubscribe varēja notikt pēc ielādes.
    const consent = await prisma.identityEmailConsent.findUnique({
      where: { id: sequence.consentId },
    });
    // Krīzes aizsardzība (defense-in-depth): ja submission ir safetyTriggered,
    // secība ir jāatceļ arī tad, ja tā tika izveidota pirms karoga.
    const submission = sequence.submissionId
      ? await prisma.identityTestSubmission.findUnique({
          where: { id: sequence.submissionId },
          select: { locale: true, safetyTriggered: true },
        })
      : null;
    if (
      !consent ||
      !consent.marketingConsent ||
      consent.withdrawalTimestamp ||
      submission?.safetyTriggered
    ) {
      await prisma.identityEmailSequence.update({
        where: { id: sequence.id },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      });
      cancelled += 1;
      continue;
    }

    const locale = submission?.locale ?? "en";

    const resolved = await resolveSequenceTemplate(sequence.nextStep, locale);
    if (!resolved) {
      // Veidne nav publicēta → solis tiek izlaists (statuss atpakaļ ACTIVE, mēģina rīt).
      await prisma.identityEmailSequence.update({
        where: { id: sequence.id },
        data: { status: "ACTIVE", claimedAt: null },
      });
      skipped += 1;
      continue;
    }

    // Otra pārbaude tieši pirms sūtīšanas - sašaurina unsubscribe sacensības logu.
    // Atkārtojam arī krīzes karoga pārbaudi (submission varēja tikt atzīmēts).
    const [consentNow, submissionNow] = await Promise.all([
      prisma.identityEmailConsent.findUnique({
        where: { id: sequence.consentId },
        select: { marketingConsent: true, withdrawalTimestamp: true },
      }),
      sequence.submissionId
        ? prisma.identityTestSubmission.findUnique({
            where: { id: sequence.submissionId },
            select: { safetyTriggered: true },
          })
        : Promise.resolve(null),
    ]);
    if (!consentNow?.marketingConsent || consentNow.withdrawalTimestamp || submissionNow?.safetyTriggered) {
      await prisma.identityEmailSequence.update({
        where: { id: sequence.id },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      });
      cancelled += 1;
      continue;
    }

    const email = decryptField(sequence.email);
    const unsubscribeUrl = `${getAppBaseUrl()}/api/identity-test/unsubscribe?token=${createUnsubscribeToken(sequence.consentId)}`;
    const unsubscribeLabel = locale === "lv"
      ? "Vairs nevēlos saņemt šos e-pastus"
      : "Unsubscribe from these emails";

    const content = buildSequenceEmail({
      subject: resolved.subject,
      bodyText: resolved.body,
      unsubscribeUrl,
      unsubscribeLabel,
    });

    const reserved = await reserveDelivery({
      requestId: `seq:${sequence.id}:${sequence.nextStep}`,
      recipient: email,
      emailKind: "SEQUENCE_STEP",
      submissionId: sequence.submissionId ?? undefined,
      step: sequence.nextStep,
    });
    if (!reserved.row) {
      skipped += 1;
      continue;
    }

    const outcome = await deliverEmail(reserved.row.id, {
      subject: resolved.subject, html: content.html, text: content.text,
    }, { kind: "identity-test-sequence", context: { step: sequence.nextStep } });

    const next = nextStepAfter(sequence.nextStep);
    const nextTemplate = next
      ? await prisma.identityEmailTemplate.findUnique({ where: { step: next } })
      : null;

    if (outcome.ok) {
      sent += 1;
      await prisma.identityEmailSequence.update({
        where: { id: sequence.id },
        data: next
          ? {
              status: "ACTIVE",
              nextStep: next,
              nextSendAt: new Date(Date.now() + Math.max(0, (nextTemplate?.delayDays ?? 1) - (resolved.template.delayDays)) * 24 * 60 * 60 * 1000),
              claimedAt: null,
            }
          : { status: "COMPLETED", completedAt: new Date() },
      });
    } else {
      // Sūtīšana neizdevās → atstājam ACTIVE ar tādu pašu nextSendAt (delivery row glabā retry grafiku).
      await prisma.identityEmailSequence.update({
        where: { id: sequence.id },
        data: { status: "ACTIVE", claimedAt: null },
      });
      skipped += 1;
    }
  }

  return { processed: due.length, sent, cancelled, skipped };
}

/** Atteikšanās: reģistrē izņemšanu un atomiski atceļ visas nenosūtītās secības darbības. */
export async function withdrawConsent(consentId: string): Promise<boolean> {
  try {
    await prisma.$transaction([
      prisma.identityEmailConsent.update({
        where: { id: consentId },
        data: { withdrawalTimestamp: new Date() },
      }),
      prisma.identityEmailSequence.updateMany({
        where: {
          consentId,
          status: { in: ["ACTIVE", "PROCESSING", "PAUSED"] },
        },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      }),
    ]);
    return true;
  } catch {
    return false;
  }
}
