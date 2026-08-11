import { getEmailConfig } from "./config";
import { maskEmailAddress } from "./client";

export function logEmailAttempt(input: {
  kind: string;
  recipient: string;
  subject: string;
  context?: Record<string, string | undefined>;
}): void {
  const { isConfigured, missingVariables } = getEmailConfig();

  console.info("[email] attempted", {
    kind: input.kind,
    recipient: maskEmailAddress(input.recipient),
    subject: input.subject,
    configured: isConfigured,
    missingVariables: isConfigured ? undefined : missingVariables,
    ...input.context,
  });
}

export function logEmailResult(input: {
  kind: string;
  recipient: string;
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  providerId?: string;
  context?: Record<string, string | undefined>;
}): void {
  const level = input.ok ? "info" : input.skipped ? "warn" : "error";
  const payload = {
    kind: input.kind,
    recipient: maskEmailAddress(input.recipient),
    status: input.ok ? "sent" : input.skipped ? "skipped" : "failed",
    reason: input.reason,
    providerId: input.providerId,
    ...input.context,
  };

  if (level === "info") {
    console.info("[email] result", payload);
  } else if (level === "warn") {
    console.warn("[email] result", payload);
  } else {
    console.error("[email] result", payload);
  }
}
