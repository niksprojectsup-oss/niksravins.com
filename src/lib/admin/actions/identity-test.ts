"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { logAuditEvent } from "@/lib/security/audit";
import { composePortraits } from "@/lib/identity-test/compose";
import { resolveFieldValue } from "@/lib/identity-test/content";
import { resendResultEmail } from "@/lib/identity-test/submit";
import { deliverEmail, reserveDelivery } from "@/lib/identity-test/delivery";
import { buildSequenceEmail } from "@/lib/identity-test/email-templates";
import { getAppBaseUrl } from "@/lib/url";
import type {
  Prisma,
  IdentityContentEntityType,
  IdentityContentStatus,
  IdentityConnectorKind,
  IdentityEmailStep,
  IdentitySafetyFlag,
} from "@prisma/client";
import type { AuditAction } from "@/lib/security/types";

const ADMIN_BASE = "/admin/identity-test";

async function audit(action: AuditAction, entity: string, resourceId: string, metadata?: Record<string, unknown>) {
  const session = await requireAdmin();
  await logAuditEvent({
    action,
    resource: "identity_test",
    resourceId,
    actorAdminId: session.id,
    actorRole: session.role,
    metadata: { entity, ...metadata } as Prisma.InputJsonValue,
  });
  return session;
}

// ── Tēmas / apakštēmas / uzskati ────────────────────────────

export async function updateThemeAction(
  id: string,
  data: { slug?: string; sortOrder?: number; status?: IdentityContentStatus; isSensitive?: boolean },
) {
  await audit("identity_test.update", "theme", id, data);
  await prisma.identityTestTheme.update({ where: { id }, data });
  revalidatePath(ADMIN_BASE);
  return { ok: true };
}

export async function createThemeAction(data: { slug: string }) {
  await audit("identity_test.create", "theme", data.slug);
  const max = await prisma.identityTestTheme.aggregate({ _max: { sortOrder: true } });
  const row = await prisma.identityTestTheme.create({
    data: { slug: data.slug, sortOrder: (max._max.sortOrder ?? -1) + 1 },
  });
  revalidatePath(ADMIN_BASE);
  return { ok: true, id: row.id };
}

export async function updateSubcategoryAction(
  id: string,
  data: { slug?: string; sortOrder?: number; status?: IdentityContentStatus; themeId?: string },
) {
  await audit("identity_test.update", "subcategory", id, data);
  await prisma.identityTestSubcategory.update({ where: { id }, data });
  revalidatePath(ADMIN_BASE);
  return { ok: true };
}

export async function createSubcategoryAction(themeId: string, data: { slug: string }) {
  await audit("identity_test.create", "subcategory", themeId, data);
  const max = await prisma.identityTestSubcategory.aggregate({
    where: { themeId },
    _max: { sortOrder: true },
  });
  const row = await prisma.identityTestSubcategory.create({
    data: { themeId, slug: data.slug, sortOrder: (max._max.sortOrder ?? -1) + 1 },
  });
  revalidatePath(ADMIN_BASE);
  return { ok: true, id: row.id };
}

export async function updateBeliefAction(
  id: string,
  data: {
    stableKey?: string;
    subcategoryId?: string;
    sortOrder?: number;
    status?: IdentityContentStatus;
    safetyFlags?: IdentitySafetyFlag[];
    adminNotes?: string;
  },
) {
  await audit("identity_test.update", "belief", id, data);
  await prisma.identityBelief.update({ where: { id }, data });
  revalidatePath(ADMIN_BASE);
  return { ok: true };
}

export async function createBeliefAction(subcategoryId: string) {
  await audit("identity_test.create", "belief", subcategoryId);
  const max = await prisma.identityBelief.aggregate({
    where: { subcategoryId },
    _max: { sortOrder: true },
  });
  const row = await prisma.identityBelief.create({
    data: {
      subcategoryId,
      stableKey: `CUSTOM-${Date.now().toString(36)}`,
      sortOrder: (max._max.sortOrder ?? -1) + 1,
    },
  });
  revalidatePath(ADMIN_BASE);
  return { ok: true, id: row.id };
}

export async function setBeliefMechanismsAction(beliefId: string, tagIds: string[]) {
  await audit("identity_test.update", "belief_mechanisms", beliefId, { tagIds });
  await prisma.$transaction([
    prisma.identityBeliefMechanism.deleteMany({ where: { beliefId } }),
    prisma.identityBeliefMechanism.createMany({
      data: tagIds.map((tagId) => ({ beliefId, tagId })),
      skipDuplicates: true,
    }),
  ]);
  revalidatePath(ADMIN_BASE);
  return { ok: true };
}

export async function bulkPublishBeliefsAction() {
  await audit("identity_test.publish", "belief_bulk", "all");
  const result = await prisma.identityBelief.updateMany({
    where: { status: "DRAFT" },
    data: { status: "PUBLISHED" },
  });
  revalidatePath(ADMIN_BASE);
  return { ok: true, count: result.count };
}

// ── Mehānismu tagi ──────────────────────────────────────────

export async function upsertMechanismTagAction(data: {
  id?: string;
  key: string;
  sortOrder?: number;
  status?: IdentityContentStatus;
}) {
  await audit("identity_test.update", "tag", data.id ?? data.key);
  const row = data.id
    ? await prisma.identityMechanismTag.update({
        where: { id: data.id },
        data: { key: data.key, sortOrder: data.sortOrder, status: data.status },
      })
    : await prisma.identityMechanismTag.create({
        data: { key: data.key, sortOrder: data.sortOrder ?? 0 },
      });
  revalidatePath(ADMIN_BASE);
  return { ok: true, id: row.id };
}

// ── Stumbri un zari ─────────────────────────────────────────

export async function upsertTrunkAction(beliefId: string, data: { status?: IdentityContentStatus }) {
  await audit("identity_test.update", "trunk", beliefId);
  const row = await prisma.identityPositiveTrunk.upsert({
    where: { beliefId },
    update: data,
    create: { beliefId, status: data.status ?? "DRAFT" },
  });
  revalidatePath(ADMIN_BASE);
  return { ok: true, id: row.id };
}

export async function upsertBranchAction(data: {
  id?: string;
  trunkId: string;
  sortOrder?: number;
  status?: IdentityContentStatus;
}) {
  await audit("identity_test.update", "branch", data.id ?? data.trunkId);
  const row = data.id
    ? await prisma.identityPositiveBranch.update({
        where: { id: data.id },
        data: { sortOrder: data.sortOrder, status: data.status },
      })
    : await prisma.identityPositiveBranch.create({
        data: { trunkId: data.trunkId, sortOrder: data.sortOrder ?? 0 },
      });
  revalidatePath(ADMIN_BASE);
  return { ok: true, id: row.id };
}

export async function deleteBranchAction(id: string) {
  await audit("identity_test.delete", "branch", id);
  await prisma.identityPositiveBranch.delete({ where: { id } });
  revalidatePath(ADMIN_BASE);
  return { ok: true };
}

// ── Savienotājfrāzes ────────────────────────────────────────

export async function upsertConnectorAction(data: {
  id?: string;
  key: string;
  kind: IdentityConnectorKind;
  status?: IdentityContentStatus;
}) {
  await audit("identity_test.update", "connector", data.id ?? data.key);
  const row = data.id
    ? await prisma.identityConnector.update({
        where: { id: data.id },
        data: { key: data.key, kind: data.kind, status: data.status },
      })
    : await prisma.identityConnector.create({
        data: { key: data.key, kind: data.kind },
      });
  revalidatePath(ADMIN_BASE);
  return { ok: true, id: row.id };
}

// ── Tulkojumi (ar versiju vēsturi) ──────────────────────────

export async function updateTranslationAction(input: {
  entityType: IdentityContentEntityType;
  entityId: string;
  field: string;
  locale: string;
  draftValue: string;
  publish?: boolean;
}) {
  const session = await requireAdmin();
  const existing = await prisma.identityContentTranslation.findUnique({
    where: {
      entityType_entityId_field_locale: {
        entityType: input.entityType,
        entityId: input.entityId,
        field: input.field,
        locale: input.locale,
      },
    },
  });

  const previous = existing?.draftValue ?? "";
  if (previous === input.draftValue && !input.publish) return { ok: true };

  const isSourceEdit = input.locale === "lv";
  const sourceVersion = isSourceEdit ? (existing?.sourceVersion ?? 1) + 1 : (existing?.sourceVersion ?? 1);

  const row = await prisma.identityContentTranslation.upsert({
    where: {
      entityType_entityId_field_locale: {
        entityType: input.entityType,
        entityId: input.entityId,
        field: input.field,
        locale: input.locale,
      },
    },
    update: {
      draftValue: input.draftValue,
      manuallyEdited: true,
      sourceVersion,
      ...(input.publish
        ? {
            publishedValue: input.draftValue,
            translationStatus: "PUBLISHED" as const,
          }
        : {}),
    },
    create: {
      entityType: input.entityType,
      entityId: input.entityId,
      field: input.field,
      locale: input.locale,
      draftValue: input.draftValue,
      publishedValue: input.publish ? input.draftValue : null,
      manuallyEdited: true,
      sourceVersion,
      translationStatus: input.publish ? "PUBLISHED" : "NEEDS_REVIEW",
    },
  });

  await prisma.identityContentVersion.create({
    data: {
      entityType: input.entityType,
      entityId: input.entityId,
      field: input.field,
      locale: input.locale,
      previousContent: existing?.publishedValue ?? existing?.draftValue ?? null,
      newContent: input.draftValue,
      action: input.publish ? "PUBLISH" : "UPDATE",
      changedById: session.id,
    },
  });

  // LV avota maiņa → pārējo valodu tulkojumi jāpārskata.
  if (isSourceEdit) {
    await prisma.identityContentTranslation.updateMany({
      where: {
        entityType: input.entityType,
        entityId: input.entityId,
        field: input.field,
        locale: { not: "lv" },
        translationStatus: { in: ["PUBLISHED", "APPROVED", "AUTO_TRANSLATED"] },
      },
      data: { translationStatus: "NEEDS_REVIEW" },
    });
  }

  await logAuditEvent({
    action: "identity_test.update",
    resource: "identity_test",
    resourceId: `${input.entityType}:${input.entityId}:${input.field}:${input.locale}`,
    actorAdminId: session.id,
    actorRole: session.role,
    metadata: { entity: "translation" } as Prisma.InputJsonValue,
  });
  revalidatePath(ADMIN_BASE);
  return { ok: true, id: row.id };
}

export async function approveTranslationAction(id: string) {
  const session = await requireAdmin();
  const existing = await prisma.identityContentTranslation.findUnique({ where: { id } });
  if (!existing) return { ok: false };
  await prisma.identityContentTranslation.update({
    where: { id },
    data: { publishedValue: existing.draftValue, translationStatus: "PUBLISHED" },
  });
  await prisma.identityContentVersion.create({
    data: {
      entityType: existing.entityType,
      entityId: existing.entityId,
      field: existing.field,
      locale: existing.locale,
      previousContent: existing.publishedValue,
      newContent: existing.draftValue,
      action: "PUBLISH",
      changedById: session.id,
    },
  });
  revalidatePath(ADMIN_BASE);
  return { ok: true };
}

export async function restoreVersionAction(versionId: string) {
  const session = await requireAdmin();
  const version = await prisma.identityContentVersion.findUnique({ where: { id: versionId } });
  if (!version || version.previousContent === null) return { ok: false };

  await prisma.identityContentTranslation.updateMany({
    where: {
      entityType: version.entityType,
      entityId: version.entityId,
      field: version.field,
      locale: version.locale,
    },
    data: { draftValue: version.previousContent },
  });
  await prisma.identityContentVersion.create({
    data: {
      entityType: version.entityType,
      entityId: version.entityId,
      field: version.field,
      locale: version.locale,
      previousContent: version.newContent,
      newContent: version.previousContent,
      action: "RESTORE",
      changedById: session.id,
    },
  });
  revalidatePath(ADMIN_BASE);
  return { ok: true };
}

// ── E-pastu veidnes ─────────────────────────────────────────

export async function updateEmailTemplateAction(
  step: IdentityEmailStep,
  data: { delayDays?: number; status?: IdentityContentStatus },
) {
  await audit("identity_test.update", "email_template", step, data);
  await prisma.identityEmailTemplate.upsert({
    where: { step },
    update: data,
    create: { step, ...data },
  });
  revalidatePath(ADMIN_BASE);
  return { ok: true };
}

/** Testa e-pasts administratoram - SEQUENCE_STEP veidnes. Nesūta īstiem klientiem. */
export async function sendTestEmailAction(input: {
  step: IdentityEmailStep;
  locale: string;
  recipient: string;
}) {
  const session = await requireAdmin();
  const template = await prisma.identityEmailTemplate.findUnique({ where: { step: input.step } });
  if (!template) return { ok: false, reason: "no_template" };

  const [subject, body] = await Promise.all([
    resolveFieldValue({ entityType: "EMAIL_TEMPLATE", entityId: template.id, field: "subject", locale: input.locale }),
    resolveFieldValue({ entityType: "EMAIL_TEMPLATE", entityId: template.id, field: "body", locale: input.locale }),
  ]);
  if (!subject || !body) return { ok: false, reason: "no_content" };

  const content = buildSequenceEmail({
    subject,
    bodyText: body,
    unsubscribeUrl: `${getAppBaseUrl()}/api/identity-test/unsubscribe?token=admin-preview`,
    unsubscribeLabel: "Unsubscribe",
  });
  const reserved = await reserveDelivery({
    requestId: `admin:${crypto.randomUUID()}`,
    recipient: input.recipient,
    emailKind: "ADMIN_TEST",
    step: input.step,
  });
  if (!reserved.row) return { ok: false, reason: "reservation_failed" };
  const outcome = await deliverEmail(reserved.row.id, {
    subject: `[TEST] ${subject}`,
    html: content.html,
    text: content.text,
  }, { kind: "identity-test-admin-email", context: { step: input.step, adminId: session.id } });
  return outcome.ok ? { ok: true } : { ok: false, reason: outcome.error ?? "send_failed" };
}

export async function resendFailedDeliveryAction(deliveryId: string) {
  await audit("identity_test.resend", "delivery", deliveryId);
  const delivery = await prisma.identityEmailDelivery.findUnique({ where: { id: deliveryId } });
  if (!delivery) return { ok: false };
  if (delivery.emailKind === "RESULT" && delivery.resultId) {
    return resendResultEmail(delivery.resultId);
  }
  // Secības solis - atlaižam uz PENDING, cron paņems nākamajā ciklā.
  await prisma.identityEmailDelivery.update({
    where: { id: deliveryId },
    data: { status: "PENDING", nextRetryAt: new Date() },
  });
  revalidatePath(ADMIN_BASE);
  return { ok: true };
}

export async function cancelSequenceAction(sequenceId: string) {
  await audit("identity_test.cancel", "sequence", sequenceId);
  await prisma.identityEmailSequence.update({
    where: { id: sequenceId },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });
  revalidatePath(ADMIN_BASE);
  return { ok: true };
}

// ── Rezultātu priekšskatījums (draft||published, bez sūtīšanas) ──

export async function previewCompositionAction(input: {
  beliefIds: string[];
  locale: string;
}): Promise<{ ok: boolean; portraitNow: string; portraitFuture: string; warnings: string[] }> {
  await requireAdmin();
  const beliefs = await prisma.identityBelief.findMany({
    where: { id: { in: input.beliefIds } },
    include: {
      subcategory: { include: { theme: true } },
      trunk: { include: { branches: { orderBy: { sortOrder: "asc" } } } },
      mechanisms: { include: { tag: true } },
    },
  });

  const ids = beliefs.map((b) => b.id);
  const trunkIds = beliefs.map((b) => b.trunk?.id).filter((v): v is string => Boolean(v));
  const branchIds = beliefs.flatMap((b) => b.trunk?.branches.map((br) => br.id) ?? []);
  const translations = await prisma.identityContentTranslation.findMany({
    where: {
      entityType: { in: ["BELIEF", "TRUNK", "BRANCH", "CONNECTOR", "SAFETY_TEXT"] },
      entityId: { in: [...ids, ...trunkIds, ...branchIds] },
    },
  });
  const connectorsRows = await prisma.identityConnector.findMany();
  const connectorTranslations = await prisma.identityContentTranslation.findMany({
    where: { entityType: "CONNECTOR", entityId: { in: connectorsRows.map((c) => c.id) } },
  });

  const warnings: string[] = [];
  const draftOrPublished = (entityId: string, field: string) => {
    // Priekšskatījumam ņem draft || published (lai redzētu, ko rediģē).
    const rows = translations.filter(
      (r) => r.entityId === entityId && r.field === field,
    );
    for (const locale of [input.locale, "en", "lv"]) {
      const row = rows.find((r) => r.locale === locale && (r.draftValue || r.publishedValue));
      if (row) return row.draftValue || row.publishedValue || "";
    }
    return "";
  };

  const connectorTexts: Record<string, string> = {};
  for (const c of connectorsRows) {
    for (const locale of [input.locale, "en", "lv"]) {
      const row = connectorTranslations.find(
        (r) => r.entityId === c.id && r.locale === locale && (r.draftValue || r.publishedValue),
      );
      if (row) { connectorTexts[c.key] = row.draftValue || row.publishedValue || ""; break; }
    }
  }

  const resolved = beliefs.map((b) => {
    for (const f of ["text", "portraitNow", "portraitFuture"] as const) {
      if (!draftOrPublished(b.id, f)) warnings.push(`${b.stableKey}: missing ${f}`);
    }
    return {
      id: b.id,
      stableKey: b.stableKey,
      negativeBelief: draftOrPublished(b.id, "text"),
      portraitNow: draftOrPublished(b.id, "portraitNow"),
      portraitFuture: draftOrPublished(b.id, "portraitFuture"),
      trunk: b.trunk ? draftOrPublished(b.trunk.id, "text") : "",
      branches: (b.trunk?.branches ?? []).map((br) => draftOrPublished(br.id, "text")).filter(Boolean),
      mechanismKeys: b.mechanisms.map((m) => m.tag.key),
      safetyFlags: b.safetyFlags,
      themeId: b.subcategory.themeId,
      themeSlug: b.subcategory.theme.slug,
      themeName: "",
      subcategoryName: "",
      resolvedLocale: input.locale,
    };
  });

  const { portraitNow, portraitFuture } = composePortraits({
    beliefs: resolved,
    connectors: {
      opening: connectorTexts["opening"],
      joinSimilar: connectorTexts["join-similar"],
      joinContrast: connectorTexts["join-contrast"],
      transition: connectorTexts["transition"],
      closing: connectorTexts["closing"],
      closingFuture: connectorTexts["closing-future"],
    },
  });

  return { ok: true, portraitNow, portraitFuture, warnings };
}

export async function createBetaInviteAction(input: {
  label: string;
  maxUses?: number;
  expiresInDays?: number;
  locale?: string;
}) {
  const session = await requireAdmin();
  const { generateBetaToken } = await import("@/lib/identity-test/beta");
  const { token, hash } = generateBetaToken();
  const expiresAt = new Date(Date.now() + (input.expiresInDays ?? 14) * 24 * 60 * 60 * 1000);
  const row = await prisma.identityBetaInvite.create({
    data: {
      tokenHash: hash,
      label: input.label.trim().slice(0, 120),
      maxUses: Math.min(Math.max(input.maxUses ?? 5, 1), 100),
      expiresAt,
      createdById: session.id,
    },
  });
  await logAuditEvent({
    action: "identity_test.create",
    resource: "identity_test",
    resourceId: `beta-invite:${row.id}`,
    actorAdminId: session.id,
    actorRole: session.role,
    metadata: { entity: "beta_invite", label: row.label } as Prisma.InputJsonValue,
  });
  const locale = input.locale === "lv" ? "lv" : "en";
  const path = locale === "lv" ? "/lv/identity-test" : "/identity-test";
  return {
    ok: true,
    id: row.id,
    url: `${getAppBaseUrl()}/api/identity-test/redeem?token=${token}&locale=${locale}`,
    path,
  };
}

export async function revokeBetaInviteAction(id: string) {
  const session = await requireAdmin();
  await prisma.identityBetaInvite.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
  await logAuditEvent({
    action: "identity_test.update",
    resource: "identity_test",
    resourceId: `beta-invite:${id}`,
    actorAdminId: session.id,
    actorRole: session.role,
    metadata: { entity: "beta_invite", op: "revoke" } as Prisma.InputJsonValue,
  });
  revalidatePath(`${ADMIN_BASE}/beta`);
  return { ok: true };
}

// ── Publiskās pieejamības slēdzis ───────────────────────────

export async function setIdentityPublicAccessAction(enabled: boolean) {
  const session = await requireAdmin();
  await prisma.identityTestSettings.upsert({
    where: { id: "default" },
    update: { publicAccessEnabled: enabled },
    create: { id: "default", publicAccessEnabled: enabled },
  });
  await logAuditEvent({
    action: "identity_test.update",
    resource: "identity_test",
    resourceId: "settings:public-access",
    actorAdminId: session.id,
    actorRole: session.role,
    metadata: { entity: "settings", publicAccessEnabled: enabled } as Prisma.InputJsonValue,
  });
  revalidatePath(ADMIN_BASE);
  revalidatePath("/identity-test");
  revalidatePath("/lv/identity-test");
  return { ok: true };
}
