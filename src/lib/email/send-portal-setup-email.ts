import { sendEmail, maskEmailAddress, type SendEmailResult } from "./client";
import { logEmailAttempt } from "./logging";
import {
  buildCreatePasswordEmail,
  buildCreatePasswordUrl,
} from "./templates/create-password";
import { getAppBaseUrl } from "@/lib/url";

function normalizeRecipient(email: string): string {
  return email.trim().toLowerCase();
}

export async function sendCreatePasswordEmail(input: {
  firstName: string;
  email: string;
  setupToken: string;
  clientId?: string;
}): Promise<SendEmailResult> {
  const recipient = normalizeRecipient(input.email);
  const setupUrl = buildCreatePasswordUrl(input.setupToken);
  const message = buildCreatePasswordEmail({
    firstName: input.firstName,
    setupUrl,
  });

  logEmailAttempt({
    kind: "portal_setup",
    recipient,
    subject: message.subject,
    context: {
      clientId: input.clientId,
      appBaseUrl: getAppBaseUrl(),
      setupPath: "/client/set-password",
    },
  });

  const result = await sendEmail(
    {
      to: recipient,
      subject: message.subject,
      html: message.html,
      text: message.text,
    },
    {
      kind: "portal_setup",
      context: {
        clientId: input.clientId,
        appBaseUrl: getAppBaseUrl(),
        recipient: maskEmailAddress(recipient),
      },
    },
  );

  if (!result.ok) {
    console.warn("[portal] setup email not delivered", {
      clientId: input.clientId,
      recipient: maskEmailAddress(recipient),
      skipped: Boolean(result.skipped),
      reason: result.reason,
    });
  } else {
    console.info("[portal] setup email delivered", {
      clientId: input.clientId,
      recipient: maskEmailAddress(recipient),
      providerId: result.id,
      setupUrlHost: getAppBaseUrl(),
    });
  }

  return result;
}
