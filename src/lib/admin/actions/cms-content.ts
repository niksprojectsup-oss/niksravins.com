"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { isAdminEditableCmsPageSlug } from "@/lib/cms/definitions";
import { assertCmsLocale, publishContent, saveContentDraft } from "@/lib/cms/repository";
import { normalizeIncomingTiptapValue } from "@/lib/cms/tiptap";
import type { CmsTiptapJson } from "@/lib/cms/types";
import { logAuditEvent } from "@/lib/security/audit";

const PUBLIC_CMS_PATHS = ["/", "/en", "/legal"] as const;

function revalidatePublicCmsPaths(): void {
  for (const path of PUBLIC_CMS_PATHS) {
    revalidatePath(path);
  }
}

function parseFieldsPayload(raw: unknown): Record<string, CmsTiptapJson | null> {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid content payload.");
  }

  const parsed: Record<string, CmsTiptapJson | null> = {};
  for (const [fieldKey, value] of Object.entries(raw as Record<string, unknown>)) {
    parsed[fieldKey] = normalizeIncomingTiptapValue(value);
  }
  return parsed;
}

export async function saveCmsDraftAction(input: {
  pageSlug: string;
  locale: string;
  fields: unknown;
}) {
  const session = await requireAdmin();
  const locale = assertCmsLocale(input.locale);
  const fields = parseFieldsPayload(input.fields);

  if (!isAdminEditableCmsPageSlug(input.pageSlug)) {
    throw new Error("This CMS page is no longer publicly editable.");
  }

  await saveContentDraft({
    pageSlug: input.pageSlug,
    locale,
    fields,
  });

  await logAuditEvent({
    action: "cms.content.save",
    resource: "cms_page",
    resourceId: input.pageSlug,
    actorAdminId: session.id,
    actorRole: session.role,
    metadata: { locale },
  });

  revalidatePath("/admin/content");
  revalidatePath(`/admin/content/${input.pageSlug}`);
  revalidatePublicCmsPaths();

  return { ok: true as const, savedAt: new Date().toISOString() };
}

export async function publishCmsContentAction(input: {
  pageSlug: string;
  locale: string;
}) {
  const session = await requireAdmin();
  const locale = assertCmsLocale(input.locale);

  if (!isAdminEditableCmsPageSlug(input.pageSlug)) {
    throw new Error("This CMS page is no longer publicly editable.");
  }

  await publishContent({
    pageSlug: input.pageSlug,
    locale,
  });

  await logAuditEvent({
    action: "cms.content.publish",
    resource: "cms_page",
    resourceId: input.pageSlug,
    actorAdminId: session.id,
    actorRole: session.role,
    metadata: { locale },
  });

  revalidatePath("/admin/content");
  revalidatePath(`/admin/content/${input.pageSlug}`);
  revalidatePublicCmsPaths();

  return { ok: true as const, publishedAt: new Date().toISOString() };
}
