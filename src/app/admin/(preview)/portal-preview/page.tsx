import Link from "next/link";
import { AdminPortalPreview } from "@/components/admin/portal/AdminPortalPreview";
import { requireAdmin } from "@/lib/auth/guards";
import { getPortalLocale } from "@/lib/i18n/portal-locale";
import {
  ADMIN_PORTAL_PREVIEW_LABEL,
  buildAdminPortalPreviewAudit,
} from "@/lib/portal/admin-preview";
import { logAuditEvent } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export default async function AdminPortalPreviewPage() {
  const session = await requireAdmin();
  await logAuditEvent(buildAdminPortalPreviewAudit(session.id));

  const locale = await getPortalLocale();

  return (
    <div className="bg-[#f6f1e8]">
      <div className="sticky top-0 z-50 border-b border-[#eadfd2] bg-[#f7f1e8] px-4 py-2.5 md:px-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-[#2c2824]">{ADMIN_PORTAL_PREVIEW_LABEL}</p>
          <Link href="/admin" className="text-sm text-[#3f6b4e] no-underline">
            Back to admin
          </Link>
        </div>
      </div>
      <AdminPortalPreview initialLocale={locale} />
    </div>
  );
}
