import type { PurchaseStatus, StoreProduct, StoreProductStatus, StoreProductType } from "@prisma/client";
import { prisma, requireDatabase } from "@/lib/db/prisma";
import { DEFAULT_LICENSE_NOTICE, type StoreProductRecord } from "@/lib/store/types";

export type StoreProductInput = {
  slug: string;
  title: string;
  description: string;
  productType: StoreProductType;
  priceCents: number;
  currency?: string;
  status?: StoreProductStatus;
  sortOrder?: number;
  thumbnailUrl?: string | null;
  contentKey?: string | null;
  contentMimeType?: string | null;
  contentDurationSeconds?: number | null;
  bookableOfferId?: string | null;
  licenseNotice?: string | null;
};

function mapProduct(product: StoreProduct): StoreProductRecord {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    description: product.description,
    productType: product.productType,
    priceCents: product.priceCents,
    currency: product.currency,
    status: product.status,
    sortOrder: product.sortOrder,
    thumbnailUrl: product.thumbnailUrl,
    contentKey: product.contentKey,
    contentMimeType: product.contentMimeType,
    contentDurationSeconds: product.contentDurationSeconds,
    bookableOfferId: product.bookableOfferId,
    licenseNotice: product.licenseNotice,
  };
}

export async function listPublishedStoreProducts(): Promise<StoreProductRecord[]> {
  requireDatabase();
  const products = await prisma.storeProduct.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
  return products.map(mapProduct);
}

export async function listAllStoreProducts(): Promise<StoreProduct[]> {
  requireDatabase();
  return prisma.storeProduct.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
}

export async function getStoreProductById(id: string): Promise<StoreProductRecord | null> {
  requireDatabase();
  const product = await prisma.storeProduct.findUnique({ where: { id } });
  return product ? mapProduct(product) : null;
}

export async function getPublishedStoreProductById(
  id: string,
): Promise<StoreProductRecord | null> {
  requireDatabase();
  const product = await prisma.storeProduct.findFirst({
    where: { id, status: "PUBLISHED" },
  });
  return product ? mapProduct(product) : null;
}

export async function getStoreProductRecordById(id: string): Promise<StoreProduct | null> {
  requireDatabase();
  return prisma.storeProduct.findUnique({ where: { id } });
}

export async function getStoreProductPriceCents(id: string): Promise<number | null> {
  requireDatabase();
  const product = await prisma.storeProduct.findFirst({
    where: { id, status: "PUBLISHED" },
    select: { priceCents: true },
  });
  return product?.priceCents ?? null;
}

export async function createStoreProduct(input: StoreProductInput): Promise<StoreProduct> {
  requireDatabase();
  return prisma.storeProduct.create({
    data: {
      slug: input.slug,
      title: input.title,
      description: input.description,
      productType: input.productType,
      priceCents: input.priceCents,
      currency: input.currency ?? "EUR",
      status: input.status ?? "DRAFT",
      sortOrder: input.sortOrder ?? 0,
      thumbnailUrl: input.thumbnailUrl ?? null,
      contentKey: input.contentKey ?? null,
      contentMimeType: input.contentMimeType ?? null,
      contentDurationSeconds: input.contentDurationSeconds ?? null,
      bookableOfferId: input.bookableOfferId ?? null,
      licenseNotice: input.licenseNotice ?? DEFAULT_LICENSE_NOTICE,
    },
  });
}

export async function updateStoreProduct(
  id: string,
  input: Partial<StoreProductInput>,
): Promise<StoreProduct> {
  requireDatabase();
  return prisma.storeProduct.update({
    where: { id },
    data: {
      slug: input.slug,
      title: input.title,
      description: input.description,
      productType: input.productType,
      priceCents: input.priceCents,
      currency: input.currency,
      status: input.status,
      sortOrder: input.sortOrder,
      thumbnailUrl: input.thumbnailUrl,
      contentKey: input.contentKey,
      contentMimeType: input.contentMimeType,
      contentDurationSeconds: input.contentDurationSeconds,
      bookableOfferId: input.bookableOfferId,
      licenseNotice: input.licenseNotice,
    },
  });
}

export function formatStoreProductType(type: StoreProductType): string {
  switch (type) {
    case "SESSION":
      return "Session";
    case "VIDEO":
      return "Video";
    case "MEDITATION":
      return "Meditation";
    case "COURSE":
      return "Course";
    default:
      return type;
  }
}

export function formatPurchaseStatus(status: PurchaseStatus): string {
  switch (status) {
    case "PAID":
      return "Purchased";
    case "PENDING":
      return "Pending";
    case "REFUNDED":
      return "Refunded";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}
