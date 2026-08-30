import Stripe from "stripe";
import { getOfferById } from "@/lib/booking/offer-repository";
import type { ServiceKind } from "@/lib/booking/types";
import { getStripe } from "@/lib/stripe";

export type PaymentSuccessState =
  | { status: "confirmed"; offerKind: ServiceKind }
  | { status: "missing_session_id" }
  | { status: "invalid_session" }
  | { status: "not_paid" }
  | { status: "error" };

export async function verifyCheckoutSession(
  sessionId: string | undefined | null,
): Promise<PaymentSuccessState> {
  const trimmed = sessionId?.trim();
  if (!trimmed) {
    return { status: "missing_session_id" };
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(trimmed);

    if (session.payment_status !== "paid" || session.status !== "complete") {
      return { status: "not_paid" };
    }

    const serviceId = session.metadata?.serviceId;
    if (!serviceId) {
      return { status: "invalid_session" };
    }

    const offer = await getOfferById(serviceId);
    return {
      status: "confirmed",
      offerKind: offer?.kind ?? "single-session",
    };
  } catch (error) {
    if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      return { status: "invalid_session" };
    }

    console.error("[stripe] checkout verification failed:", error);
    return { status: "error" };
  }
}
