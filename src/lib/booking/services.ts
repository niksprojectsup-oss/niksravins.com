import type { BookingRecord, BookingRequest } from "./types";

/** Mock booking service for Phase 1. Replace with API route + database. */
export async function createMockBooking(
  request: BookingRequest,
): Promise<BookingRecord> {
  const now = new Date().toISOString();

  return {
    ...request,
    id: `bk_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    status: "confirmed",
    paymentStatus: "pending",
    createdAt: now,
    updatedAt: now,
  };
}

/** Future Stripe integration point. */
export async function createStripeCheckout(bookingId: string) {
  void bookingId;
  throw new Error("Stripe checkout not implemented");
}

/** Future PayPal integration point. */
export async function createPayPalOrder(bookingId: string) {
  void bookingId;
  throw new Error("PayPal checkout not implemented");
}
