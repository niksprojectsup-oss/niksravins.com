import { prisma } from "@/lib/db/prisma";
import { sendEmail } from "@/lib/email/client";
import { maskEmailAddress } from "@/lib/email/client";
import type { SendEmailInput, SendEmailResult } from "@/lib/email/client";
import { decryptField, encryptField } from "@/lib/security/encryption";
import { emailHash } from "./hash";
import type { IdentityEmailKind, IdentityEmailStep } from "@prisma/client";

const MAX_ATTEMPTS = 5;
const STALE_PROCESSING_MS = 30 * 60 * 1000;

function retryDelayMs(attempt: number): number {
  return Math.min(15 * 60 * 1000 * 2 ** (attempt - 1), 6 * 60 * 60 * 1000);
}

/**
 * Atomiska piegādes rezervācija ar deterministisku requestId:
 *   result:{resultId} | seq:{sequenceId}:{step} | admin:{uuid}
 * P2002 → jau eksistē → atgriež esošo (dubultklikšķi/paralēli pieprasījumi nedublē).
 */
export async function reserveDelivery(input: {
  requestId: string;
  recipient: string;
  emailKind: IdentityEmailKind;
  resultId?: string;
  submissionId?: string;
  step?: IdentityEmailStep;
}) {
  try {
    const row = await prisma.identityEmailDelivery.create({
      data: {
        requestId: input.requestId,
        resultId: input.resultId,
        submissionId: input.submissionId,
        recipient: encryptField(input.recipient),
        recipientHash: emailHash(input.recipient),
        emailKind: input.emailKind,
        step: input.step,
      },
    });
    return { row, created: true as const };
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      const row = await prisma.identityEmailDelivery.findUnique({
        where: { requestId: input.requestId },
      });
      return { row, created: false as const };
    }
    throw error;
  }
}

/** Atomiska pretensija: PENDING/FAILED→PROCESSING; stale PROCESSING pēc 30min atkal pretenzējams. */
export async function claimDelivery(deliveryId: string): Promise<boolean> {
  const staleBefore = new Date(Date.now() - STALE_PROCESSING_MS);
  const result = await prisma.identityEmailDelivery.updateMany({
    where: {
      id: deliveryId,
      OR: [
        { status: { in: ["PENDING", "FAILED"] } },
        { status: "PROCESSING", processingStartedAt: { lt: staleBefore } },
      ],
    },
    data: {
      status: "PROCESSING",
      processingStartedAt: new Date(),
      lastAttemptAt: new Date(),
      attemptCount: { increment: 1 },
    },
  });
  return result.count === 1;
}

export type DeliveryOutcome =
  | { ok: true; providerId?: string }
  | { ok: false; reason: "already_sent" | "lost_claim" | "send_failed"; error?: string };

/**
 * Nosūta sagatavotu e-pastu ar claim→send→mark plūsmu.
 * Ambiguāla iznākuma (timeout/5xx) gadījumā statuss paliek PENDING ar nextRetryAt.
 * E-pasta adrese/portreti nekad nenonāk žurnālos — tikai maskēta forma.
 */
export async function deliverEmail(
  deliveryId: string,
  content: { subject: string; html: string; text: string },
  meta?: { kind: string; context?: Record<string, string | undefined> },
  send: (input: SendEmailInput, meta?: { kind: string; context?: Record<string, string | undefined> }) => Promise<SendEmailResult> = sendEmail,
): Promise<DeliveryOutcome> {
  const delivery = await prisma.identityEmailDelivery.findUnique({ where: { id: deliveryId } });
  if (!delivery) return { ok: false, reason: "lost_claim" };
  if (delivery.status === "SENT") return { ok: false, reason: "already_sent" };

  const claimed = await claimDelivery(deliveryId);
  if (!claimed) return { ok: false, reason: "lost_claim" };

  const recipient = decryptField(delivery.recipient);
  const masked = maskEmailAddress(recipient);
  const result = await send(
    { to: recipient, subject: content.subject, html: content.html, text: content.text },
    { kind: meta?.kind ?? "identity-test", context: { ...meta?.context, recipientMasked: masked } },
  );

  if (result.ok) {
    await prisma.identityEmailDelivery.update({
      where: { id: deliveryId },
      data: {
        status: "SENT",
        sentAt: new Date(),
        providerMessageId: result.id,
        lastError: null,
      },
    });
    return { ok: true, providerId: result.id };
  }

  const attempts = delivery.attemptCount + 1; // claim to inkrementēja
  const exhausted = attempts >= MAX_ATTEMPTS || Boolean(result.skipped);
  await prisma.identityEmailDelivery.update({
    where: { id: deliveryId },
    data: {
      status: exhausted ? "FAILED" : "PENDING",
      nextRetryAt: exhausted ? null : new Date(Date.now() + retryDelayMs(attempts)),
      lastError: result.reason ?? "unknown_error",
    },
  });
  return { ok: false, reason: "send_failed", error: result.reason };
}
