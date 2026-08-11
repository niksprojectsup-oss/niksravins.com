import { siteConfig } from "@/content/site";
import { formatSlotDate, formatSlotTime } from "@/lib/booking/timezone";
import { getAppBaseUrl } from "@/lib/url";
import type { EmailMessage } from "../types";
import { detailRow, detailsTable, wrapEmailHtml } from "./layout";

export function buildPackageSessionConfirmationEmail(input: {
  clientFirstName: string;
  clientTimezone: string;
  sessionNumber: number;
  totalSessions: number;
  scheduledAt: string;
}): EmailMessage {
  const sessionDate = formatSlotDate(input.scheduledAt, input.clientTimezone);
  const sessionTime = formatSlotTime(input.scheduledAt, input.clientTimezone);
  const portalUrl = `${getAppBaseUrl()}/client/login`;

  const subject = `Session ${input.sessionNumber} confirmed — ${sessionDate}`;

  const text = [
    `Dear ${input.clientFirstName},`,
    "",
    `Your package session ${input.sessionNumber} of ${input.totalSessions} is confirmed.`,
    "",
    `Date: ${sessionDate}`,
    `Time: ${sessionTime} (${input.clientTimezone})`,
    `Duration: 45 minutes`,
    "",
    "Your session will take place online. A meeting link will be sent before your appointment.",
    "",
    `You can view your package progress and book remaining sessions in your Client Portal:`,
    portalUrl,
    "",
    siteConfig.name,
  ].join("\n");

  const html = wrapEmailHtml(`
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:400;line-height:1.3;color:#1a1917;">Session ${input.sessionNumber} confirmed</h1>
    <p style="margin:0 0 24px;font-size:16px;color:#4a4743;">Dear ${input.clientFirstName},</p>
    <p style="margin:0 0 8px;font-size:16px;color:#4a4743;">Your package session ${input.sessionNumber} of ${input.totalSessions} is confirmed.</p>
    ${detailsTable(
      [
        detailRow("Date", sessionDate),
        detailRow("Time", `${sessionTime} (${input.clientTimezone})`),
        detailRow("Duration", "45 minutes"),
      ].join(""),
    )}
    <p style="margin:24px 0 16px;font-size:15px;color:#4a4743;">
      Your session will take place online. A meeting link will be sent before your appointment.
    </p>
    <p style="margin:0 0 24px;">
      <a href="${portalUrl}" style="display:inline-block;background-color:#1a1917;color:#fdfcfa;text-decoration:none;padding:14px 24px;border-radius:8px;font-size:15px;">
        Access your Client Portal
      </a>
    </p>
    <p style="margin:0;font-size:14px;color:#7a756d;">Book your remaining sessions any time from your Client Portal.</p>
  `);

  return { subject, html, text };
}
