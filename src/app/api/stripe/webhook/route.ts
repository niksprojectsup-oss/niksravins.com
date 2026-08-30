import { NextResponse } from "next/server";
import { createBooking } from "@/lib/booking/booking-repository";
import { completeBookingSideEffects } from "@/lib/booking/complete-booking-side-effects";
import { getStripe } from "@/lib/stripe";
import { prisma, requireDatabase } from "@/lib/db/prisma";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const payload = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error("[stripe] webhook signature failed:", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const checkoutSessionId = session.id;
    const metadata = session.metadata ?? {};

    requireDatabase();

    const existing = await prisma.payment.findUnique({
      where: { stripeCheckoutSessionId: checkoutSessionId },
    });
    if (existing) {
      return NextResponse.json({ received: true });
    }

    const serviceId = metadata.serviceId ?? "";
    const slotId = metadata.slotId ?? "";
    const scheduledAt = metadata.scheduledAt ?? "";
    const courseStartDate = metadata.courseStartDate || null;

    if (!serviceId || !scheduledAt || !metadata.email) {
      return NextResponse.json({ error: "Incomplete metadata." }, { status: 400 });
    }

    try {
      const booking = await createBooking({
        serviceId,
        slotId,
        scheduledAt,
        courseStartDate,
        client: {
          firstName: metadata.firstName ?? "",
          lastName: metadata.lastName ?? "",
          email: metadata.email,
          phone: metadata.phone || undefined,
          country: metadata.country ?? "",
          timezone: metadata.timezone ?? "Europe/Riga",
          sessionIntention: metadata.sessionIntention ?? "",
        },
      });

      await prisma.payment.updateMany({
        where: {
          clientId: booking.clientId,
          status: "PENDING",
        },
        data: {
          status: "PAID",
          provider: "stripe",
          stripeCheckoutSessionId: checkoutSessionId,
        },
      });

      await completeBookingSideEffects(booking);
    } catch (error) {
      console.error("[stripe] webhook booking failed:", error);
      return NextResponse.json({ error: "Booking failed." }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
