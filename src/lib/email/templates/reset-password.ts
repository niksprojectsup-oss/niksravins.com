import { siteConfig } from "@/content/site";
import { getAppBaseUrl } from "@/lib/url";
import { wrapEmailHtml } from "./layout";
import type { EmailMessage } from "../types";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function buildResetPasswordUrl(token: string): string {
  return `${getAppBaseUrl()}/client/set-password?token=${encodeURIComponent(token)}`;
}

export function buildResetPasswordEmail(input: {
  firstName: string;
  resetUrl: string;
}): EmailMessage {
  const subject = "Reset your Client Portal password";
  const safeName = escapeHtml(input.firstName);
  const safeUrl = escapeHtml(input.resetUrl);

  const text = [
    `Dear ${input.firstName},`,
    "",
    "We received a request to reset your Client Portal password.",
    "",
    "Choose a new password here:",
    input.resetUrl,
    "",
    "This link expires in 1 hour and can only be used once.",
    "",
    "If you did not request this, you can ignore this email.",
    "",
    siteConfig.name,
  ].join("\n");

  const html = wrapEmailHtml(`
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:400;line-height:1.3;color:#1a1917;">Reset your password</h1>
    <p style="margin:0 0 16px;font-size:16px;color:#4a4743;">Dear ${safeName},</p>
    <p style="margin:0 0 16px;font-size:16px;color:#4a4743;">
      We received a request to reset your Client Portal password.
    </p>
    <p style="margin:0 0 24px;">
      <a href="${safeUrl}" style="display:inline-block;background-color:#1a1917;color:#fdfcfa;text-decoration:none;padding:14px 24px;border-radius:8px;font-size:15px;">
        Choose a new password
      </a>
    </p>
    <p style="margin:0;font-size:14px;color:#7a756d;">This link expires in 1 hour and can only be used once. If you did not request this, you can ignore this email.</p>
  `);

  return { subject, html, text };
}
