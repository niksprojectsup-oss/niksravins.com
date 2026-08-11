import { getServiceById, isPackageService } from "@/lib/booking/services-catalog";
import type { BookingRecord } from "@/lib/booking/types";
import { ADMIN_NOTIFICATION_EMAIL } from "./config";
import { sendEmail } from "./client";
import { logEmailAttempt } from "./logging";
import { buildBookingAdminNotificationEmail } from "./templates/booking-admin-notification";
import { buildBookingConfirmationEmail } from "./templates/booking-confirmation";
import type { BookingEmailPayload } from "./types";

function toEmailPayload(booking: BookingRecord): BookingEmailPayload | null {
  const service = getServiceById(booking.serviceId);
  if (!service) return null;

  return {
    bookingId: booking.id,
    serviceId: booking.serviceId,
    clientFirstName: booking.client.firstName,
    clientLastName: booking.client.lastName,
    clientEmail: booking.client.email.trim().toLowerCase(),
    clientTimezone: booking.client.timezone,
    serviceTitle: service.title,
    durationLabel: service.durationLabel ?? `${service.durationMinutes ?? 45} minutes`,
    scheduledAt: booking.scheduledAt,
    isPackage: isPackageService(booking.serviceId),
    checkoutNote: service.checkoutNote,
  };
}

/**
 * Sends client confirmation and admin notification emails.
 * Never throws — booking persistence must not depend on email delivery.
 */
export async function sendBookingConfirmationEmails(
  booking: BookingRecord,
): Promise<void> {
  const payload = toEmailPayload(booking);
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
