import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { adminPages } from "@/content/admin";
import { formatCurrency } from "@/lib/admin/format";
import {
  formatStoreProductType,
  listAllStoreProducts,
} from "@/lib/store/product-repository";
import type { StoreProduct } from "@prisma/client";
import { Button } from "@/components/ui/Button";

function productStatusVariant(
  product: StoreProduct,
): "default" | "accent" | "muted" | "warm" {
  if (product.status === "PUBLISHED") return "accent";
  return "muted";
}

function productStatusLabel(product: StoreProduct): string {
  return product.status === "PUBLISHED" ? "Published" : "Draft";
}

export default async function AdminStorePage() {
  const products = await listAllStoreProducts();

  return (
    <div className="layout-stack-lg max-w-wide">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <AdminPageHeader
          title={adminPages.store.title}
          description={adminPages.store.description}
          className="border-b-0 pb-0"
        />
        <Button href="/admin/store/new">+ Add product</Button>
      </div>

      <AdminTable<StoreProduct>
        rows={products}
        emptyMessage="No store products yet. Add your first digital product."
        columns={[
          {
            key: "title",
            header: "Product",
            cell: (row) => (
              <div>
                <p className="font-medium text-ink">{row.title}</p>
                <p className="type-caption text-ink-subtle">{row.slug}</p>
              </div>
            ),
          },
          {
            key: "price",
            header: "Price",
            cell: (row) => formatCurrency(row.priceCents, row.currency),
          },
          {
            key: "type",
            header: "Type",
            cell: (row) => formatStoreProductType(row.productType),
          },
          {
            key: "status",
            header: "Status",
            cell: (row) => (
              <AdminStatusBadge
                label={productStatusLabel(row)}
                variant={productStatusVariant(row)}
              />
            ),
          },
          {
            key: "actions",
            header: "",
            cell: (row) => (
              <Link
                href={`/admin/store/${row.id}/edit`}
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
