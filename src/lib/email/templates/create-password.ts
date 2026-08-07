import { siteConfig } from "@/content/site";
import { getAppBaseUrl } from "@/lib/url";
import { wrapEmailHtml } from "./layout";
import type { EmailMessage } from "../types";

export function buildCreatePasswordEmail(input: {
  firstName: string;
  setupUrl: string;
}): EmailMessage {
  const subject = "Create your Client Portal password";

  const text = [
    `Dear ${input.firstName},`,
    "",
    "Your session is booked. You can access your Client Portal to view upcoming sessions, track progress, and book your next session.",
    "",
    "Create your password here:",
    input.setupUrl,
    "",
    "This link expires in 7 days.",
    "",
    siteConfig.name,
  ].join("\n");

  const html = wrapEmailHtml(`
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:400;line-height:1.3;color:#1a1917;">Create your password</h1>
    <p style="margin:0 0 16px;font-size:16px;color:#4a4743;">Dear ${input.firstName},</p>
    <p style="margin:0 0 16px;font-size:16px;color:#4a4743;">
      Your session is booked. Access your Client Portal to view upcoming sessions,
      track progress, and book your next session.
    </p>
    <p style="margin:0 0 24px;">
      <a href="${input.setupUrl}" style="display:inline-block;background-color:#1a1917;color:#fdfcfa;text-decoration:none;padding:14px 24px;border-radius:8px;font-size:15px;">
        Create your password
      </a>
    </p>
    <p style="margin:0;font-size:14px;color:#7a756d;">This link expires in 7 days. If you did not book a session, you can ignore this email.</p>
  `);

  return { subject, html, text };
}

export function buildCreatePasswordUrl(setupToken: string): string {
  return `${getAppBaseUrl()}/client/set-password?token=${encodeURIComponent(setupToken)}`;
}
