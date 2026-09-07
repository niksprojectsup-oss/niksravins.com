export type CheckoutType = "booking" | "store";

export const DEFAULT_LICENSE_NOTICE =
  "Licensed for personal use only. Do not copy, share, distribute or resell.";

export type StoreProductRecord = {
  id: string;
  slug: string;
  title: string;
  description: string;
  productType: "SESSION" | "VIDEO" | "MEDITATION" | "COURSE";
  priceCents: number;
  currency: string;
  status: "DRAFT" | "PUBLISHED";
  sortOrder: number;
  thumbnailUrl: string | null;
  contentKey: string | null;
  contentMimeType: string | null;
  contentDurationSeconds: number | null;
  bookableOfferId: string | null;
  licenseNotice: string | null;
};

export type PurchaseRecord = {
  id: string;
  clientId: string;
  productId: string;
  paymentId: string | null;
  status: "PENDING" | "PAID" | "REFUNDED" | "CANCELLED";
  purchasedAt: string | null;
  product: StoreProductRecord;
};

export function resolveCheckoutType(
  metadata: Record<string, string | undefined>,
): CheckoutType {
  if (metadata.checkoutType === "store") return "store";
  if (metadata.checkoutType === "booking") return "booking";
  if (metadata.productId) return "store";
  return "booking";
}

export function isPublishedProduct(product: Pick<StoreProductRecord, "status">): boolean {
  return product.status === "PUBLISHED";
}

export function clientOwnsProduct(
  clientId: string,
  purchase: Pick<PurchaseRecord, "clientId" | "status"> | null | undefined,
): boolean {
  if (!purchase) return false;
  return purchase.clientId === clientId && purchase.status === "PAID";
}
