import type { StoreContentRef } from "@/lib/store/content/types";
import type { PurchaseRecord, StoreProductRecord } from "@/lib/store/types";

export type ContentAccessDecision =
  | { allowed: true; ref: StoreContentRef }
  | { allowed: false; reason: string };

export function canAccessStoreContent(input: {
  authenticatedClientId: string;
  productId: string;
  product: Pick<StoreProductRecord, "id" | "contentKey" | "contentMimeType"> | null;
  purchase: Pick<PurchaseRecord, "clientId" | "productId" | "status"> | null;
}): ContentAccessDecision {
  if (!input.product || input.product.id !== input.productId) {
    return { allowed: false, reason: "Product not found." };
  }

  if (!input.product.contentKey) {
    return { allowed: false, reason: "Content unavailable." };
  }

  if (!input.purchase || input.purchase.productId !== input.productId) {
    return { allowed: false, reason: "Purchase not found." };
  }

  if (input.purchase.clientId !== input.authenticatedClientId) {
    return { allowed: false, reason: "Access denied." };
  }

  if (input.purchase.status !== "PAID") {
    return { allowed: false, reason: "Purchase not active." };
  }

  return {
    allowed: true,
    ref: {
      objectKey: input.product.contentKey,
      mimeType: input.product.contentMimeType ?? "video/mp4",
    },
  };
}

export function isProductVisibleInStore(
  product: Pick<StoreProductRecord, "status">,
): boolean {
  return product.status === "PUBLISHED";
}

export function shouldCreatePurchaseFromWebhook(input: {
  existingPaymentHasPurchase: boolean;
}): boolean {
  return !input.existingPaymentHasPurchase;
}
