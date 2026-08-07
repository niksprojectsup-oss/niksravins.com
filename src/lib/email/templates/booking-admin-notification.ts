import { formatSlotDate, formatSlotTime, BUSINESS_TIMEZONE } from "@/lib/booking/timezone";
import type { BookingEmailPayload, EmailMessage } from "../types";
import { detailRow, detailsTable, wrapEmailHtml } from "./layout";

export function buildBookingAdminNotificationEmail(
  payload: BookingEmailPayload,
): EmailMessage {
  const clientName = `${payload.clientFirstName} ${payload.clientLastName}`.trim();
  const sessionDate = formatSlotDate(payload.scheduledAt, BUSINESS_TIMEZONE);
  const sessionTime = formatSlotTime(payload.scheduledAt, BUSINESS_TIMEZONE);
  const clientLocalTime = formatSlotTime(payload.scheduledAt, payload.clientTimezone);

  const subject = `New booking — ${clientName}`;

  const text = [
    "A new session has been booked.",
    "",
    `Client: ${clientName}`,
    `Email: ${payload.clientEmail}`,
    `Session: ${payload.serviceTitle}`,
    `Date: ${sessionDate}`,
    `Time: ${sessionTime} (${BUSINESS_TIMEZONE})`,
    `Client timezone: ${payload.clientTimezone} (${clientLocalTime} local)`,
    `Booking ID: ${payload.bookingId}`,
  ].join("\n");

  const html = wrapEmailHtml(`
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:400;line-height:1.3;color:#1a1917;">New booking</h1>
    <p style="margin:0 0 24px;font-size:16px;color:#4a4743;">A new session has been booked through niksravins.com.</p>
    ${detailsTable(
      [
        detailRow("Client", clientName),
        detailRow("Email", payload.clientEmail),
        detailRow("Session", payload.serviceTitle),
        detailRow("Date", sessionDate),
        detailRow("Time (Riga)", `${sessionTime} (${BUSINESS_TIMEZONE})`),
        detailRow("Client time", `${clientLocalTime} (${payload.clientTimezone})`),
        detailRow("Booking ID", payload.bookingId),
      ].join(""),
    )}
  `);

  return { subject, html, text };
}
