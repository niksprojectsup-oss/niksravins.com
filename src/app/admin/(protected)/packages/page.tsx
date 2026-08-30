import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AdminStatusBadge,
} from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { adminPages } from "@/content/admin";
import { formatCurrency } from "@/lib/admin/format";
import { listAllOffers } from "@/lib/booking/offer-repository";
import type { BookableOffer } from "@prisma/client";
import { Button } from "@/components/ui/Button";

function offerTypeLabel(offerType: BookableOffer["offerType"]): string {
  switch (offerType) {
    case "SINGLE_SESSION":
      return "Single session";
    case "PACKAGE":
      return "Package";
    case "COURSE":
      return "Course";
    default:
      return offerType;
  }
}

function offerStatusVariant(
  offer: BookableOffer,
): "default" | "accent" | "muted" | "warm" {
  if (!offer.active) return "warm";
  if (!offer.published) return "muted";
  return "accent";
}

function offerStatusLabel(offer: BookableOffer): string {
  if (!offer.active) return "Disabled";
  if (!offer.published) return "Hidden";
  return "Published";
}

export default async function AdminPackagesPage() {
  const offers = await listAllOffers();

  return (
    <div className="layout-stack-lg max-w-wide">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <AdminPageHeader
          title={adminPages.packages.title}
          description={adminPages.packages.description}
          className="border-b-0 pb-0"
        />
        <Button href="/admin/packages/new">+ Add offer</Button>
      </div>

      <AdminTable<BookableOffer>
        rows={offers}
        emptyMessage="No offers yet. Add your first bookable offer."
        columns={[
          {
            key: "title",
            header: "Offer",
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
            cell: (row) => offerTypeLabel(row.offerType),
          },
          {
            key: "status",
            header: "Status",
            cell: (row) => (
              <AdminStatusBadge
                label={offerStatusLabel(row)}
                variant={offerStatusVariant(row)}
              />
            ),
          },
          {
            key: "actions",
            header: "",
            cell: (row) => (
              <Link
                href={`/admin/packages/${row.id}/edit`}
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
