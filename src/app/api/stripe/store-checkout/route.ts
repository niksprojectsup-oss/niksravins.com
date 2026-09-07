import { NextResponse } from "next/server";
import { isClientAuthSessionActive } from "@/lib/auth/client-repository";
import { getServerSession } from "@/lib/auth/session";
import {
  getPublishedStoreProductById,
  getStoreProductPriceCents,
} from "@/lib/store/product-repository";
import { clientHasPaidPurchase } from "@/lib/store/purchase-repository";
import { getStripe } from "@/lib/stripe";

async function requireStoreCheckoutClient() {
  const session = await getServerSession();
  if (!session || session.role !== "CLIENT" || !session.clientId) {
    return null;
  }

  const active = await isClientAuthSessionActive(session.sessionId);
  if (!active) return null;

  return session;
}

export async function POST(request: Request) {
  try {
    const session = await requireStoreCheckoutClient();
    if (!session?.clientId) {
      return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    }

    const body = (await request.json()) as { productId?: string };
    const productId = body.productId?.trim();
    if (!productId) {
      return NextResponse.json({ error: "Product is required." }, { status: 400 });
    }

    const product = await getPublishedStoreProductById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product is not available." }, { status: 400 });
    }

    const amountCents = await getStoreProductPriceCents(productId);
    if (!amountCents || amountCents <= 0) {
      return NextResponse.json({ error: "Invalid product price." }, { status: 400 });
    }

    const alreadyOwned = await clientHasPaidPurchase(session.clientId, productId);
    if (alreadyOwned) {
      return NextResponse.json(
        { error: "You already own this product." },
        { status: 400 },
      );
    }

    const origin = new URL(request.url).origin;
    const stripe = getStripe();

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: session.email.trim().toLowerCase(),
      line_items: [
        {
          price_data: {
            currency: product.currency.toLowerCase(),
            product_data: {
              name: product.title,
              description: product.description,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        checkoutType: "store",
        productId: product.id,
        clientId: session.clientId,
      },
      success_url: `${origin}/client/purchases?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/client/store`,
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[stripe] store checkout creation failed:", error);
    return NextResponse.json(
      { error: "Unable to create Stripe checkout session." },
      { status: 500 },
    );
  }
}
