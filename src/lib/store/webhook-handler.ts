import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getPublishedStoreProductById, getStoreProductPriceCents } from "@/lib/store/product-repository";
import { fulfillStorePurchase } from "@/lib/store/purchase-repository";

export async function handleStoreCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<NextResponse> {
  const metadata = session.metadata ?? {};
  const checkoutSessionId = session.id;
  const clientId = metadata.clientId ?? "";
  const productId = metadata.productId ?? "";

  if (!clientId || !productId) {
    return NextResponse.json({ error: "Incomplete store metadata." }, { status: 400 });
  }

  const product = await getPublishedStoreProductById(productId);
  if (!product) {
    return NextResponse.json({ error: "Product not available." }, { status: 400 });
  }

  const expectedPrice = await getStoreProductPriceCents(productId);
  if (expectedPrice === null || expectedPrice <= 0) {
    return NextResponse.json({ error: "Invalid product price." }, { status: 400 });
  }

  const paidAmount = session.amount_total ?? expectedPrice;
  if (paidAmount !== expectedPrice) {
    return NextResponse.json({ error: "Payment amount mismatch." }, { status: 400 });
  }

  const currency = (session.currency ?? product.currency).toUpperCase();
  if (currency !== product.currency.toUpperCase()) {
    return NextResponse.json({ error: "Payment currency mismatch." }, { status: 400 });
  }

  try {
    await fulfillStorePurchase({
      checkoutSessionId,
      clientId,
      productId,
      amountCents: expectedPrice,
      currency: product.currency,
    });
  } catch (error) {
    console.error("[stripe] webhook store purchase failed:", error);
    return NextResponse.json({ error: "Store purchase failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
