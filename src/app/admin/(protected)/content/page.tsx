import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { adminPages } from "@/content/admin";
import { ADMIN_EDITABLE_CMS_PAGE_SLUGS, CMS_LOCALE_LABELS } from "@/lib/cms/definitions";
import { listCmsPages } from "@/lib/cms/repository";
import { seedCmsPages } from "@/lib/cms/seed";
import type { CmsPageSummary } from "@/lib/cms/types";

function pageStatusVariant(
  page: CmsPageSummary,
): "default" | "accent" | "muted" | "warm" {
  return page.status === "PUBLISHED" ? "accent" : "muted";
}

export default async function AdminContentPage() {
  await seedCmsPages();
  const pages = (await listCmsPages()).filter((page) =>
    ADMIN_EDITABLE_CMS_PAGE_SLUGS.includes(page.slug as (typeof ADMIN_EDITABLE_CMS_PAGE_SLUGS)[number]),
  );

  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader
        title={adminPages.content.title}
        description={adminPages.content.description}
      />

      <AdminTable<CmsPageSummary>
        rows={pages}
        emptyMessage="No CMS pages yet. Run database seed to create default pages."
        columns={[
          {
            key: "title",
            header: "Page",
            cell: (row) => (
              <div>
                <p className="font-medium text-ink">{row.title}</p>
                <p className="type-caption text-ink-subtle">{row.slug}</p>
              </div>
            ),
          },
          {
            key: "status",
            header: "Status",
            cell: (row) => (
              <AdminStatusBadge
                label={row.status === "PUBLISHED" ? "Published" : "Draft"}
                variant={pageStatusVariant(row)}
              />
            ),
          },
          {
            key: "locales",
            header: "Locales",
            cell: () => (
              <p className="type-caption text-ink-subtle">
                {Object.values(CMS_LOCALE_LABELS).join(" · ")}
              </p>
            ),
          },
          {
            key: "updated",
            header: "Last updated",
            cell: (row) => (
              <p className="type-caption text-ink-subtle">
                {new Date(row.updatedAt).toLocaleString()}
              </p>
            ),
          },
          {
            key: "actions",
            header: "",
            cell: (row) => (
              <Link
                href={`/admin/content/${row.slug}`}
                className="type-caption text-accent no-underline hover:text-accent-strong"
              >
                Edit
              </Link>
            ),
          },
        ]}
      />
    </div>
  );
}
