import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeClient) return stripeClient;

  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  stripeClient = new Stripe(secretKey);
  return stripeClient;
}

/** @deprecated Use getStripe() */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return Reflect.get(getStripe(), prop);
  },
});
