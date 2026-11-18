import { prisma } from "@/lib/db/prisma";
import { localeFallbackChain } from "./content";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_BELIEFS = 200;

export type PayloadValidation =
  | { ok: true }
  | { ok: false; message: string };

export function validateSubmitPayload(input: {
  requestId?: unknown;
  name?: unknown;
  email?: unknown;
  locale?: unknown;
  beliefIds?: unknown;
  allowedLocales: readonly string[];
}): PayloadValidation {
  if (typeof input.requestId !== "string" || !UUID_RE.test(input.requestId)) {
    return { ok: false, message: "invalid_request_id" };
  }
  if (typeof input.name !== "string" || input.name.trim().length === 0 || input.name.length > 120) {
    return { ok: false, message: "invalid_name" };
  }
  if (typeof input.email !== "string" || !EMAIL_RE.test(input.email) || input.email.length > 254) {
    return { ok: false, message: "invalid_email" };
  }
  if (typeof input.locale !== "string" || !input.allowedLocales.includes(input.locale)) {
    return { ok: false, message: "invalid_locale" };
  }
  if (!Array.isArray(input.beliefIds) || input.beliefIds.length === 0 || input.beliefIds.length > MAX_BELIEFS) {
    return { ok: false, message: "invalid_belief_selection" };
  }
  if (!input.beliefIds.every((id) => typeof id === "string" && id.length <= 64)) {
    return { ok: false, message: "invalid_belief_selection" };
  }
  if (new Set(input.beliefIds).size !== input.beliefIds.length) {
    return { ok: false, message: "duplicate_beliefs" };
  }
  return { ok: true };
}

export type BeliefValidation =
  | { ok: true }
  | { ok: false; message: string };

/**
 * Servera puse pārbauba atlasītos uzskatus:
 * eksistence, PUBLISHED statuss (uzskats+apakštēma+tēma), publicēts teksts
 * un abi portretu fragmenti pieprasītajā vai fallback valodā.
 */
export async function validateBeliefSelection(
  beliefIds: string[],
  locale: string,
): Promise<BeliefValidation> {
  const beliefs = await prisma.identityBelief.findMany({
    where: { id: { in: beliefIds } },
    include: { subcategory: { include: { theme: true } } },
  });

  if (beliefs.length !== beliefIds.length) {
    return { ok: false, message: "unknown_beliefs" };
  }

  for (const belief of beliefs) {
    if (belief.status !== "PUBLISHED") {
      return { ok: false, message: `belief_not_published:${belief.stableKey}` };
    }
    if (belief.subcategory.status !== "PUBLISHED" || belief.subcategory.theme.status !== "PUBLISHED") {
      return { ok: false, message: `structure_not_published:${belief.stableKey}` };
    }
  }

  const chain = localeFallbackChain(locale);
  const translations = await prisma.identityContentTranslation.findMany({
    where: {
      entityType: "BELIEF",
      entityId: { in: beliefIds },
      field: { in: ["text", "portraitNow", "portraitFuture"] },
      locale: { in: chain },
      publishedValue: { not: null },
    },
    select: { entityId: true, field: true, locale: true },
  });

  for (const belief of beliefs) {
    for (const field of ["text", "portraitNow", "portraitFuture"] as const) {
      const covered = chain.some((l) =>
        translations.some((t) => t.entityId === belief.id && t.field === field && t.locale === l),
      );
      if (!covered) {
        return { ok: false, message: `content_incomplete:${belief.stableKey}:${field}` };
      }
    }
  }

  return { ok: true };
}
