import { Resend } from "resend";
import { getEmailConfig } from "./config";

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  const { apiKey } = getEmailConfig();
  if (!apiKey) return null;

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

function normalizeRecipients(to: string | string[]): string[] {
  return (Array.isArray(to) ? to : [to]).map((address) => address.trim()).filter(Boolean);
}

/** Mask an email address for secure logging (e.g. j***@example.com). */
export function maskEmailAddress(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "[invalid-email]";
  const visible = local.length <= 2 ? local.charAt(0) : local.slice(0, 1);
  return `${visible}***@${domain}`;
}

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
};

export type SendEmailResult =
  | { ok: true; id?: string }
  | { ok: false; skipped?: boolean; reason?: string };

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const { from, isConfigured } = getEmailConfig();

  if (!isConfigured || !from) {
    console.warn("[email] Skipped send — RESEND_API_KEY or EMAIL_FROM is not configured.");
    return { ok: false, skipped: true, reason: "not_configured" };
  }

  const client = getResendClient();
  if (!client) {
    console.warn("[email] Skipped send — Resend client unavailable.");
    return { ok: false, skipped: true, reason: "client_unavailable" };
  }

  const recipients = normalizeRecipients(input.to);

  try {
    const result = await client.emails.send({
      from,
      to: recipients,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    if (result.error) {
      console.error("[email] Resend API error", {
        recipients: recipients.map(maskEmailAddress),
        subject: input.subject,
        message: result.error.message,
        name: result.error.name,
      });
      return { ok: false, reason: result.error.message };
    }

    return { ok: true, id: result.data?.id };
  } catch (error) {
    console.error("[email] Unexpected send failure", {
      recipients: recipients.map(maskEmailAddress),
      subject: input.subject,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return { ok: false, reason: error instanceof Error ? error.message : "unknown_error" };
  }
}
