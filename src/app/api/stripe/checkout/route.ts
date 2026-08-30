import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getActiveOfferById, getOfferPriceCents, isCourseOffer } from "@/lib/booking/offer-repository";
import { parseBookingFormData } from "@/lib/booking/form-data";
import { validateBookingRequest } from "@/lib/booking/validation";
import { bookingSuccessPath } from "@/lib/booking/booking-success-path";
import { parseLocaleParam } from "@/lib/i18n/locales";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      country,
      timezone,
      sessionIntention,
      serviceId,
      slotId,
      scheduledAt,
      courseStartDate,
      locale: localeParam,
    } = body as Record<string, string | undefined>;

    const locale: Locale =
      localeParam && parseLocaleParam(localeParam) ? parseLocaleParam(localeParam)! : DEFAULT_LOCALE;

    const formData = new FormData();
    for (const [key, value] of Object.entries({
      serviceId: serviceId ?? "",
      slotId: slotId ?? "",
      scheduledAt: scheduledAt ?? "",
      courseStartDate: courseStartDate ?? "",
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      email: email ?? "",
      phone: phone ?? "",
      country: country ?? "",
      timezone: timezone ?? "",
      sessionIntention: sessionIntention ?? "",
    })) {
      formData.set(key, value);
    }

    const bookingRequest = parseBookingFormData(formData);
    const validationError = await validateBookingRequest(bookingRequest);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const service = await getActiveOfferById(bookingRequest.serviceId);
    if (!service) {
      return NextResponse.json(
        { error: "Selected service is not available." },
        { status: 400 },
      );
    }

    const amountCents = await getOfferPriceCents(bookingRequest.serviceId);
    if (!amountCents || amountCents <= 0) {
      return NextResponse.json({ error: "Invalid service price." }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const stripe = getStripe();
    const isCourse = isCourseOffer(service);

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: bookingRequest.client.email.trim().toLowerCase(),
      line_items: [
        {
          price_data: {
            currency: service.currency.toLowerCase(),
            product_data: {
              name: service.title,
              description: service.description,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        serviceId: bookingRequest.serviceId,
        slotId: isCourse ? `course-start:${bookingRequest.courseStartDate}` : bookingRequest.slotId,
        scheduledAt: isCourse
          ? `${bookingRequest.courseStartDate}T09:00:00.000Z`
          : bookingRequest.scheduledAt,
        courseStartDate: bookingRequest.courseStartDate ?? "",
        firstName: bookingRequest.client.firstName.trim(),
        lastName: bookingRequest.client.lastName.trim(),
        email: bookingRequest.client.email.trim().toLowerCase(),
        phone: bookingRequest.client.phone?.trim() ?? "",
        country: bookingRequest.client.country,
        timezone: bookingRequest.client.timezone,
        sessionIntention: bookingRequest.client.sessionIntention.trim(),
        locale,
      },
      success_url: `${origin}${bookingSuccessPath(locale)}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${localizedPath(locale, "book")}`,
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[stripe] checkout creation failed:", error);
    return NextResponse.json(
      { error: "Unable to create Stripe checkout session." },
      { status: 500 },
    );
  }
}
