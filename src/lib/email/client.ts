import { Resend } from "resend";
import { getEmailConfig } from "./config";
import { logEmailResult } from "./logging";

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

export async function sendEmail(
  input: SendEmailInput,
  meta?: { kind: string; context?: Record<string, string | undefined> },
): Promise<SendEmailResult> {
  const { from, isConfigured, missingVariables } = getEmailConfig();
  const recipients = normalizeRecipients(input.to);
  const primaryRecipient = recipients[0] ?? "unknown";

  if (!isConfigured || !from) {
    const result = {
      ok: false as const,
      skipped: true as const,
      reason: `not_configured:${missingVariables.join(",")}`,
    };
    if (meta) {
      logEmailResult({
        kind: meta.kind,
        recipient: primaryRecipient,
        ok: false,
        skipped: true,
        reason: result.reason,
        context: meta.context,
      });
    }
    return result;
  }

  const client = getResendClient();
  if (!client) {
    const result = { ok: false as const, skipped: true as const, reason: "client_unavailable" };
    if (meta) {
      logEmailResult({
        kind: meta.kind,
        recipient: primaryRecipient,
        ok: false,
        skipped: true,
        reason: result.reason,
        context: meta.context,
      });
    }
    return result;
  }

  try {
    const result = await client.emails.send({
      from,
      to: recipients,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    if (result.error) {
      const failure = { ok: false as const, reason: result.error.message };
      if (meta) {
        logEmailResult({
          kind: meta.kind,
          recipient: primaryRecipient,
          ok: false,
          reason: `${result.error.name}: ${result.error.message}`,
          context: meta.context,
        });
      }
      return failure;
    }

    const success = { ok: true as const, id: result.data?.id };
    if (meta) {
      logEmailResult({
        kind: meta.kind,
        recipient: primaryRecipient,
        ok: true,
        providerId: result.data?.id,
        context: meta.context,
      });
    }
    return success;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    if (meta) {
      logEmailResult({
        kind: meta.kind,
        recipient: primaryRecipient,
        ok: false,
        reason: message,
        context: meta.context,
      });
    }
    return { ok: false, reason: message };
  }
}
