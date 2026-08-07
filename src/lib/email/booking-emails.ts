import { siteConfig } from "@/content/site";
import { getEmailConfig } from "@/lib/email/config";
import {
  logEmailFailure,
  logEmailSkipped,
  recipientDomainFromEmail,
} from "@/lib/email/log";
import { getResendClient } from "@/lib/email/resend-client";
import { getServiceById, isPackageService } from "@/lib/booking/services-catalog";
import type { BookingRecord } from "@/lib/booking/types";
import {
  formatSlotDate,
  formatSlotTime,
} from "@/lib/booking/timezone";

function clientDisplayName(booking: BookingRecord): string {
  const first = booking.client.firstName.trim();
  const last = booking.client.lastName.trim();
  return [first, last].filter(Boolean).join(" ") || "there";
}

function sessionTypeLabel(booking: BookingRecord): string {
  return getServiceById(booking.serviceId)?.title ?? "Session";
}

function formatBookingDateTime(booking: BookingRecord): {
  date: string;
  time: string;
  timezone: string;
} {
  const timezone = booking.client.timezone.trim() || "UTC";

  return {
    date: formatSlotDate(booking.scheduledAt, timezone),
    time: formatSlotTime(booking.scheduledAt, timezone),
    timezone,
  };
}

function clientNextSteps(booking: BookingRecord): string[] {
  if (isPackageService(booking.serviceId)) {
    return [
      "Your first session is scheduled for the date and time above.",
      "Payment details will be shared separately if they are still outstanding.",
      "Your remaining package sessions will be arranged directly with Niks after your first session.",
      "If you need to reschedule, reply to this email as soon as possible.",
    ];
  }

  return [
    "Your session is scheduled for the date and time above.",
    "Payment details will be shared separately if they are still outstanding.",
    "Before the session, take a moment to note the reaction or pattern you would like to work on.",
    "If you need to reschedule, reply to this email as soon as possible.",
  ];
}

function buildClientEmail(booking: BookingRecord): {
  subject: string;
  html: string;
  text: string;
} {
  const name = clientDisplayName(booking);
  const sessionType = sessionTypeLabel(booking);
  const { date, time, timezone } = formatBookingDateTime(booking);
  const nextSteps = clientNextSteps(booking);

  const nextStepsHtml = nextSteps
    .map((step) => `<li style="margin-bottom:8px;">${step}</li>`)
    .join("");

  const nextStepsText = nextSteps.map((step, index) => `${index + 1}. ${step}`).join("\n");

  const subject = `Session confirmed — ${sessionType}`;

  const html = `
    <div style="font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;line-height:1.6;max-width:560px;">
      <p style="margin:0 0 16px;">Hello ${name},</p>
      <p style="margin:0 0 24px;">Your session with ${siteConfig.name} is confirmed.</p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
        <tr><td style="padding:8px 0;color:#666;">Session</td><td style="padding:8px 0;">${sessionType}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Date</td><td style="padding:8px 0;">${date}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Time</td><td style="padding:8px 0;">${time}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Timezone</td><td style="padding:8px 0;">${timezone}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Confirmation</td><td style="padding:8px 0;">${booking.id}</td></tr>
      </table>
      <p style="margin:0 0 8px;font-weight:600;">Next steps</p>
      <ul style="margin:0 0 24px;padding-left:20px;">${nextStepsHtml}</ul>
      <p style="margin:0 0 8px;">I look forward to meeting you.</p>
      <p style="margin:0;">${siteConfig.name}</p>
    </div>
  `.trim();

  const text = [
    `Hello ${name},`,
    "",
    `Your session with ${siteConfig.name} is confirmed.`,
    "",
    `Session: ${sessionType}`,
    `Date: ${date}`,
    `Time: ${time}`,
    `Timezone: ${timezone}`,
    `Confirmation: ${booking.id}`,
    "",
    "Next steps:",
    nextStepsText,
    "",
    "I look forward to meeting you.",
    siteConfig.name,
  ].join("\n");

  return { subject, html, text };
}

function buildAdminEmail(booking: BookingRecord): {
  subject: string;
  html: string;
  text: string;
} {
  const clientName = clientDisplayName(booking);
  const sessionType = sessionTypeLabel(booking);
  const { date, time, timezone } = formatBookingDateTime(booking);
  const intention = booking.client.sessionIntention.trim();

  const subject = `New booking — ${clientName} — ${sessionType}`;

  const html = `
    <div style="font-family:Arial,sans-serif;color:#1a1a1a;line-height:1.5;max-width:560px;">
      <p style="margin:0 0 16px;">A new booking was confirmed on ${siteConfig.name}.</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#666;">Client</td><td style="padding:6px 0;">${clientName}</td></tr>
        <tr><td style="padding:6px 0;color:#666;">Email</td><td style="padding:6px 0;">${booking.client.email}</td></tr>
        <tr><td style="padding:6px 0;color:#666;">Phone</td><td style="padding:6px 0;">${booking.client.phone?.trim() || "—"}</td></tr>
        <tr><td style="padding:6px 0;color:#666;">Country</td><td style="padding:6px 0;">${booking.client.country}</td></tr>
        <tr><td style="padding:6px 0;color:#666;">Session</td><td style="padding:6px 0;">${sessionType}</td></tr>
        <tr><td style="padding:6px 0;color:#666;">Date</td><td style="padding:6px 0;">${date}</td></tr>
        <tr><td style="padding:6px 0;color:#666;">Time</td><td style="padding:6px 0;">${time}</td></tr>
        <tr><td style="padding:6px 0;color:#666;">Timezone</td><td style="padding:6px 0;">${timezone}</td></tr>
        <tr><td style="padding:6px 0;color:#666;">Booking ID</td><td style="padding:6px 0;">${booking.id}</td></tr>
        <tr><td style="padding:6px 0;color:#666;vertical-align:top;">Intention</td><td style="padding:6px 0;">${intention || "—"}</td></tr>
      </table>
    </div>
  `.trim();

  const text = [
    "A new booking was confirmed.",
    "",
    `Client: ${clientName}`,
    `Email: ${booking.client.email}`,
    `Phone: ${booking.client.phone?.trim() || "—"}`,
    `Country: ${booking.client.country}`,
    `Session: ${sessionType}`,
    `Date: ${date}`,
    `Time: ${time}`,
    `Timezone: ${timezone}`,
    `Booking ID: ${booking.id}`,
    `Intention: ${intention || "—"}`,
  ].join("\n");

  return { subject, html, text };
}

async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
  bookingId: string;
  recipientRole: "client" | "admin";
}): Promise<void> {
  const config = getEmailConfig();
  const resend = getResendClient();

  if (!config || !resend) {
    logEmailSkipped("Email provider is not configured", params.bookingId);
    return;
  }

  const { error } = await resend.emails.send({
    from: config.from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function sendBookingConfirmationEmails(
  booking: BookingRecord,
): Promise<void> {
  const config = getEmailConfig();
  if (!config) {
    logEmailSkipped("RESEND_API_KEY is not set", booking.id);
    return;
  }

  const clientEmail = buildClientEmail(booking);
  const adminEmail = buildAdminEmail(booking);

  const deliveries = [
    {
      to: booking.client.email.trim(),
      recipientRole: "client" as const,
      ...clientEmail,
    },
    {
      to: config.adminNotificationEmail,
      recipientRole: "admin" as const,
      ...adminEmail,
    },
  ];

  await Promise.all(
    deliveries.map(async (delivery) => {
      try {
        await sendEmail({
          to: delivery.to,
          subject: delivery.subject,
          html: delivery.html,
          text: delivery.text,
          bookingId: booking.id,
          recipientRole: delivery.recipientRole,
        });
      } catch (error) {
        logEmailFailure(error, {
          bookingId: booking.id,
          recipientRole: delivery.recipientRole,
          recipientDomain: recipientDomainFromEmail(delivery.to),
        });
      }
    }),
  );
}
