import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getActiveOfferById, getOfferPriceCents, isCourseOffer } from "@/lib/booking/offer-repository";
import { parseBookingFormData } from "@/lib/booking/form-data";
import { localizeOffer } from "@/lib/booking/localize-offer";
import { validateBookingRequest } from "@/lib/booking/validation";
import { bookingSuccessPath } from "@/lib/booking/booking-success-path";
import { getPublicContent } from "@/content/i18n";
import { parseLocaleParam } from "@/lib/i18n/locales";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";

export async function POST(request: Request) {
  let locale: Locale = DEFAULT_LOCALE;

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

    locale =
      localeParam && parseLocaleParam(localeParam) ? parseLocaleParam(localeParam)! : DEFAULT_LOCALE;
    const checkoutCopy = getPublicContent(locale).bookingUi.validation;
    const offerCopy = getPublicContent(locale).bookingOffers;

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
    const validationError = await validateBookingRequest(bookingRequest, checkoutCopy);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const serviceRecord = await getActiveOfferById(bookingRequest.serviceId);
    if (!serviceRecord) {
      return NextResponse.json(
        { error: checkoutCopy.serviceUnavailable },
        { status: 400 },
      );
    }
    const service = localizeOffer(serviceRecord, offerCopy);

    const amountCents = await getOfferPriceCents(bookingRequest.serviceId);
    if (!amountCents || amountCents <= 0) {
      return NextResponse.json({ error: checkoutCopy.invalidPrice }, { status: 400 });
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
        checkoutType: "booking",
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
        { error: checkoutCopy.stripeNoUrl },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[stripe] checkout creation failed:", error);
    return NextResponse.json(
      { error: getPublicContent(locale).bookingUi.validation.stripeCreateFailed },
      { status: 500 },
    );
  }
}
