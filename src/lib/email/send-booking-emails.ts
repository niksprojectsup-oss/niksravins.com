import { getServiceById, isPackageService } from "@/lib/booking/services-catalog";
import type { BookingRecord } from "@/lib/booking/types";
import { ADMIN_NOTIFICATION_EMAIL } from "./config";
import { maskEmailAddress, sendEmail } from "./client";
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
  const clientResult = await sendEmail({
    to: payload.clientEmail,
    subject: clientEmail.subject,
    html: clientEmail.html,
    text: clientEmail.text,
  });

  if (!clientResult.ok && !clientResult.skipped) {
    console.error("[email] Client confirmation failed", {
      bookingId: payload.bookingId,
      recipient: maskEmailAddress(payload.clientEmail),
      reason: clientResult.reason,
    });
  }

  const adminEmail = buildBookingAdminNotificationEmail(payload);
  const adminResult = await sendEmail({
    to: ADMIN_NOTIFICATION_EMAIL,
    subject: adminEmail.subject,
    html: adminEmail.html,
    text: adminEmail.text,
  });

  if (!adminResult.ok && !adminResult.skipped) {
    console.error("[email] Admin notification failed", {
      bookingId: payload.bookingId,
      recipient: maskEmailAddress(ADMIN_NOTIFICATION_EMAIL),
      reason: adminResult.reason,
    });
  }
}
