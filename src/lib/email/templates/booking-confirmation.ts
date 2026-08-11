import { siteConfig } from "@/content/site";
import { formatSlotDate, formatSlotTime } from "@/lib/booking/timezone";
import { getAppBaseUrl } from "@/lib/url";
import type { BookingEmailPayload, EmailMessage } from "../types";
import { detailRow, detailsTable, wrapEmailHtml } from "./layout";

function buildNextSteps(payload: BookingEmailPayload): string[] {
  const portalUrl = `${getAppBaseUrl()}/client/login`;

  if (payload.isPackage) {
    return [
      "Your first session is confirmed. Your Deep Transformation Package includes 5 sessions in total, each 45 minutes.",
      "You can schedule your remaining sessions through your Client Portal — choose from available dates and times at your convenience.",
      `Access your Client Portal: ${portalUrl}`,
      "Your session will take place online. A meeting link will be sent before your appointment.",
      "Payment instructions will follow separately if payment has not yet been completed.",
      `If you need to make changes, reply to this email or contact ${siteConfig.email}.`,
    ];
  }

  return [
    "Your session will take place online. A meeting link will be sent before your appointment.",
    "Payment instructions will follow separately if payment has not yet been completed.",
    `If you need to make changes, reply to this email or contact ${siteConfig.email}.`,
  ];
}

export function buildBookingConfirmationEmail(
  payload: BookingEmailPayload,
): EmailMessage {
  const sessionDate = formatSlotDate(payload.scheduledAt, payload.clientTimezone);
  const sessionTime = formatSlotTime(payload.scheduledAt, payload.clientTimezone);
  const nextSteps = buildNextSteps(payload);
  const portalUrl = `${getAppBaseUrl()}/client/login`;

  const subject = payload.isPackage
    ? `Package booking confirmed — ${sessionDate}`
    : `Session confirmed — ${sessionDate}`;

  const text = [
    `Dear ${payload.clientFirstName},`,
    "",
    payload.isPackage
      ? "Thank you for booking the Deep Transformation Package. Your first session is confirmed."
      : "Your session with Niks Ravins is confirmed.",
    "",
    `Session: ${payload.serviceTitle}`,
    `Duration: ${payload.durationLabel}`,
    `Date: ${sessionDate}`,
    `Time: ${sessionTime} (${payload.clientTimezone})`,
    "",
    "Next steps:",
    ...nextSteps.map((step, index) => `${index + 1}. ${step}`),
    "",
    "I look forward to meeting you.",
    "",
    siteConfig.name,
  ].join("\n");

  const portalCta = payload.isPackage
    ? `<p style="margin:24px 0 16px;">
        <a href="${portalUrl}" style="display:inline-block;background-color:#1a1917;color:#fdfcfa;text-decoration:none;padding:14px 24px;border-radius:8px;font-size:15px;">
          Access your Client Portal
        </a>
      </p>`
    : "";

  const html = wrapEmailHtml(`
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:400;line-height:1.3;color:#1a1917;">${
      payload.isPackage ? "Your package booking is confirmed" : "Your session is confirmed"
    }</h1>
    <p style="margin:0 0 24px;font-size:16px;color:#4a4743;">Dear ${payload.clientFirstName},</p>
    <p style="margin:0 0 8px;font-size:16px;color:#4a4743;">${
      payload.isPackage
        ? "Thank you for booking the Deep Transformation Package. Your first session is confirmed."
        : "Thank you for booking. Here are your session details:"
    }</p>
    ${detailsTable(
      [
        detailRow("Session", payload.serviceTitle),
        detailRow("Duration", payload.durationLabel),
        detailRow("Date", sessionDate),
        detailRow("Time", `${sessionTime} (${payload.clientTimezone})`),
      ].join(""),
    )}
    <h2 style="margin:24px 0 12px;font-size:15px;font-weight:400;letter-spacing:0.02em;color:#1a1917;">Next steps</h2>
    <ol style="margin:0;padding-left:20px;color:#4a4743;font-size:15px;">
      ${nextSteps.map((step) => `<li style="margin-bottom:8px;">${step}</li>`).join("")}
    </ol>
    ${portalCta}
    <p style="margin:28px 0 0;font-size:16px;color:#4a4743;">I look forward to meeting you.</p>
    <p style="margin:8px 0 0;font-size:16px;color:#1a1917;">${siteConfig.name}</p>
  `);

  return { subject, html, text };
}
