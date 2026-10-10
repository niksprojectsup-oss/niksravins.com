"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { LOCALES, LOCALIZED_PUBLIC_PAGES } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";
import {
  assertCanEditTranslations,
  validateTranslationDrafts,
} from "@/lib/i18n/translation-access";
import { isCmsOwnedCatalogKey } from "@/lib/cms/field-ownership";
import { ADDABLE_LIST_FIELDS, isAddableListPrefix } from "@/lib/i18n/translation-catalog";
import { assertTranslationLocale } from "@/lib/i18n/translation-locales";
import {
  addTranslationListItem,
  publishTranslationLocale,
  saveTranslationDrafts,
} from "@/lib/i18n/translation-repository";
import { logAuditEvent } from "@/lib/security/audit";

function revalidatePublicTranslationPaths(): void {
  for (const locale of LOCALES) {
    for (const page of LOCALIZED_PUBLIC_PAGES) {
      revalidatePath(localizedPath(locale, page));
    }
    revalidatePath(`${localizedPath(locale, "book")}/success`);
  }
}

export async function saveTranslationDraftsAction(input: {
  locale: string;
  drafts: { key: string; value: string }[];
}) {
  const session = await requireAdmin();
  assertCanEditTranslations(session.role);

  const { locale, drafts } = validateTranslationDrafts(input.locale, input.drafts);
  await saveTranslationDrafts({ locale, drafts });

  await logAuditEvent({
    action: "translation.save",
    resource: "translation",
    resourceId: locale,
    actorAdminId: session.id,
    actorRole: session.role,
    metadata: { count: drafts.length },
  });

  revalidatePath("/admin/translations");
  return { ok: true as const, savedAt: new Date().toISOString() };
}

export async function publishTranslationsAction(input: { locale: string }) {
  const session = await requireAdmin();
  assertCanEditTranslations(session.role);

  const locale = assertTranslationLocale(input.locale);
  const published = await publishTranslationLocale(locale);

  await logAuditEvent({
    action: "translation.publish",
    resource: "translation",
    resourceId: locale,
    actorAdminId: session.id,
    actorRole: session.role,
    metadata: { published },
  });

  revalidatePath("/admin/translations");
  revalidatePublicTranslationPaths();
  return { ok: true as const, published, publishedAt: new Date().toISOString() };
}

export async function addTranslationItemAction(input: {
  prefix: string;
  fields: Record<string, string>;
}) {
  const session = await requireAdmin();
  assertCanEditTranslations(session.role);

  if (
    !isAddableListPrefix(input.prefix) ||
    !ADDABLE_LIST_FIELDS[input.prefix] ||
    isCmsOwnedCatalogKey(input.prefix)
  ) {
    throw new Error("This section does not support new items.");
  }

  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(input.fields ?? {})) {
    if (typeof key !== "string" || typeof value !== "string") {
      throw new Error("Invalid new-item payload.");
    }
    fields[key] = value.trim();
  }

  const keys = await addTranslationListItem({ prefix: input.prefix, fields });

  await logAuditEvent({
    action: "translation.add",
    resource: "translation",
    resourceId: input.prefix,
    actorAdminId: session.id,
    actorRole: session.role,
    metadata: { keys },
  });

  revalidatePath("/admin/translations");
  return { ok: true as const, keys };
}
