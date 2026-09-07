import type { Purchase, StoreProduct } from "@prisma/client";
import { prisma, requireDatabase } from "@/lib/db/prisma";
import type { PurchaseRecord, StoreProductRecord } from "@/lib/store/types";

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

function mapPurchase(
  purchase: Purchase & { product: StoreProduct },
): PurchaseRecord {
  return {
    id: purchase.id,
    clientId: purchase.clientId,
    productId: purchase.productId,
    paymentId: purchase.paymentId,
    status: purchase.status,
    purchasedAt: purchase.purchasedAt?.toISOString() ?? null,
    product: mapProduct(purchase.product),
  };
}

export async function listClientPurchases(clientId: string): Promise<PurchaseRecord[]> {
  requireDatabase();
  const purchases = await prisma.purchase.findMany({
    where: { clientId, status: "PAID" },
    include: { product: true },
    orderBy: [{ purchasedAt: "desc" }, { createdAt: "desc" }],
  });
  return purchases.map(mapPurchase);
}

export async function getClientPurchaseForProduct(
  clientId: string,
  productId: string,
): Promise<PurchaseRecord | null> {
  requireDatabase();
  const purchase = await prisma.purchase.findFirst({
    where: { clientId, productId, status: "PAID" },
    include: { product: true },
    orderBy: { purchasedAt: "desc" },
  });
  return purchase ? mapPurchase(purchase) : null;
}

export async function clientHasPaidPurchase(
  clientId: string,
  productId: string,
): Promise<boolean> {
  requireDatabase();
  const purchase = await prisma.purchase.findFirst({
    where: { clientId, productId, status: "PAID" },
    select: { id: true },
  });
  return purchase !== null;
}

export async function fulfillStorePurchase(input: {
  checkoutSessionId: string;
  clientId: string;
  productId: string;
  amountCents: number;
  currency: string;
}): Promise<{ created: boolean }> {
  requireDatabase();

  const existingPayment = await prisma.payment.findUnique({
    where: { stripeCheckoutSessionId: input.checkoutSessionId },
    include: { purchase: true },
  });

  if (existingPayment?.purchase) {
    return { created: false };
  }

  await prisma.$transaction(async (tx) => {
    const payment = existingPayment
      ? existingPayment
      : await tx.payment.create({
          data: {
            clientId: input.clientId,
            amountCents: input.amountCents,
            currency: input.currency,
            status: "PAID",
            provider: "stripe",
            stripeCheckoutSessionId: input.checkoutSessionId,
          },
        });

    const existingPurchase = await tx.purchase.findUnique({
      where: { paymentId: payment.id },
    });
    if (existingPurchase) return;

    await tx.purchase.create({
      data: {
        clientId: input.clientId,
        productId: input.productId,
        paymentId: payment.id,
        status: "PAID",
        purchasedAt: new Date(),
      },
    });
  });

  return { created: true };
}
