import { siteConfig } from "@/content/site";
import { getAppBaseUrl } from "@/lib/url";
import { wrapEmailHtml } from "./layout";
import type { EmailMessage } from "../types";

export function buildPortalInviteEmail(input: {
  firstName: string;
  setupUrl: string;
}): EmailMessage {
  const subject = "You are invited to your Client Portal";

  const text = [
    `Dear ${input.firstName},`,
    "",
    "You have been invited to access your Client Portal. There you can view upcoming sessions, track your progress, and prepare for your work together.",
    "",
    "Create your password to get started:",
    input.setupUrl,
    "",
    "This link expires in 7 days.",
    "",
    siteConfig.name,
  ].join("\n");

  const html = wrapEmailHtml(`
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:400;line-height:1.3;color:#1a1917;">You are invited</h1>
    <p style="margin:0 0 16px;font-size:16px;color:#4a4743;">Dear ${input.firstName},</p>
    <p style="margin:0 0 16px;font-size:16px;color:#4a4743;">
      You have been invited to access your Client Portal. There you can view upcoming
      sessions, track your progress, and prepare for your work together.
    </p>
    <p style="margin:0 0 24px;">
      <a href="${input.setupUrl}" style="display:inline-block;background-color:#1a1917;color:#fdfcfa;text-decoration:none;padding:14px 24px;border-radius:8px;font-size:15px;">
        Create your password
      </a>
    </p>
    <p style="margin:0;font-size:14px;color:#7a756d;">This link expires in 7 days. If you were not expecting this invitation, you can ignore this email.</p>
  `);

  return { subject, html, text };
}

export function buildPortalInviteUrl(setupToken: string): string {
  return `${getAppBaseUrl()}/client/set-password?token=${encodeURIComponent(setupToken)}`;
}
