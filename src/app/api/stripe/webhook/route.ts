import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createBooking } from "@/lib/booking/booking-repository";
import { completeBookingSideEffects } from "@/lib/booking/complete-booking-side-effects";
import { prisma, requireDatabase } from "@/lib/db/prisma";
import { resolveCheckoutType } from "@/lib/store/types";
import { handleStoreCheckoutCompleted } from "@/lib/store/webhook-handler";

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

    const checkoutType = resolveCheckoutType(metadata);
    if (checkoutType === "store") {
      return handleStoreCheckoutCompleted(session);
    }

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

    // Reconcile a partially processed session: if a booking was created for
    // this slot but its payment was never linked, finish linking instead of
    // letting slot validation block the retry forever.
    const orphanBooking = await prisma.booking.findFirst({
      where: { slotId, session: { scheduledAt: new Date(scheduledAt) } },
      include: { client: true, session: true },
    });
    if (orphanBooking) {
      await prisma.payment.updateMany({
        where: { clientId: orphanBooking.clientId, status: "PENDING" },
        data: {
          status: "PAID",
          provider: "stripe",
          stripeCheckoutSessionId: checkoutSessionId,
        },
      });
      await completeBookingSideEffects({
        id: orphanBooking.id,
        clientId: orphanBooking.clientId,
        serviceId: orphanBooking.serviceId,
        slotId: orphanBooking.slotId,
        scheduledAt: orphanBooking.session.scheduledAt.toISOString(),
        courseStartDate: orphanBooking.courseStartDate?.toISOString() ?? null,
        client: {
          firstName: orphanBooking.client.firstName,
          lastName: orphanBooking.client.lastName,
          email: orphanBooking.client.email,
          phone: orphanBooking.client.phone ?? undefined,
          country: orphanBooking.client.country,
          timezone: orphanBooking.client.timezone,
          sessionIntention: orphanBooking.sessionIntention,
        },
        status: "confirmed",
        paymentStatus: "paid",
        paymentProvider: "stripe",
        createdAt: orphanBooking.createdAt.toISOString(),
        updatedAt: orphanBooking.updatedAt.toISOString(),
      });
      return NextResponse.json({ received: true });
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
