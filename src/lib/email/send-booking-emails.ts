import { getServiceById, isPackageService, getServiceDurationMinutes } from "@/lib/booking/services-catalog";
import type { BookingRecord } from "@/lib/booking/types";
import { createBookingCalendarToken } from "@/lib/calendar/booking-calendar-token";
import { ADMIN_NOTIFICATION_EMAIL } from "./config";
import { sendEmail } from "./client";
import { logEmailAttempt } from "./logging";
import { buildBookingAdminNotificationEmail } from "./templates/booking-admin-notification";
import { buildBookingConfirmationEmail } from "./templates/booking-confirmation";
import type { BookingEmailPayload } from "./types";

async function toEmailPayload(booking: BookingRecord): Promise<BookingEmailPayload | null> {
  const service = getServiceById(booking.serviceId);
  if (!service) return null;

  const durationMinutes = getServiceDurationMinutes(booking.serviceId);
  const meetingLink = process.env.SESSION_MEETING_URL?.trim() || null;
  const calendarToken = await createBookingCalendarToken({
    bookingId: booking.id,
    scheduledAt: booking.scheduledAt,
    serviceTitle: service.title,
    durationMinutes,
    clientTimezone: booking.client.timezone,
  });

  return {
    bookingId: booking.id,
    serviceId: booking.serviceId,
    clientFirstName: booking.client.firstName,
    clientLastName: booking.client.lastName,
    clientEmail: booking.client.email.trim().toLowerCase(),
    clientTimezone: booking.client.timezone,
    serviceTitle: service.title,
    durationLabel: service.durationLabel ?? `${service.durationMinutes ?? 45} minutes`,
    durationMinutes,
    scheduledAt: booking.scheduledAt,
    isPackage: isPackageService(booking.serviceId),
    checkoutNote: service.checkoutNote,
    meetingLink,
    calendarToken,
  };
}

/**
 * Sends client confirmation and admin notification emails.
 * Never throws — booking persistence must not depend on email delivery.
 */
export async function sendBookingConfirmationEmails(
  booking: BookingRecord,
): Promise<void> {
  const payload = await toEmailPayload(booking);
  if (!payload) {
    console.error("[email] Skipped booking emails — unknown service", {
      bookingId: booking.id,
      serviceId: booking.serviceId,
    });
    return;
  }

  const clientEmail = buildBookingConfirmationEmail(payload);
  logEmailAttempt({
    kind: "booking_confirmation",
    recipient: payload.clientEmail,
    subject: clientEmail.subject,
    context: { bookingId: payload.bookingId },
  });
  await sendEmail(
    {
      to: payload.clientEmail,
      subject: clientEmail.subject,
      html: clientEmail.html,
      text: clientEmail.text,
    },
    { kind: "booking_confirmation", context: { bookingId: payload.bookingId } },
  );

  const adminEmail = buildBookingAdminNotificationEmail(payload);
  logEmailAttempt({
    kind: "booking_admin_notification",
    recipient: ADMIN_NOTIFICATION_EMAIL,
    subject: adminEmail.subject,
    context: { bookingId: payload.bookingId },
  });
  await sendEmail(
    {
      to: ADMIN_NOTIFICATION_EMAIL,
      subject: adminEmail.subject,
      html: adminEmail.html,
      text: adminEmail.text,
    },
    { kind: "booking_admin_notification", context: { bookingId: payload.bookingId } },
  );
}
