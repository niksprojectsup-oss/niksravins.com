import { maskEmailAddress, sendEmail } from "./client";
import {
  buildCreatePasswordEmail,
  buildCreatePasswordUrl,
} from "./templates/create-password";

export async function sendCreatePasswordEmail(input: {
  firstName: string;
  email: string;
  setupToken: string;
}): Promise<void> {
  const setupUrl = buildCreatePasswordUrl(input.setupToken);
  const message = buildCreatePasswordEmail({
    firstName: input.firstName,
    setupUrl,
  });

  const result = await sendEmail({
    to: input.email,
    subject: message.subject,
    html: message.html,
    text: message.text,
  });

  if (!result.ok && !result.skipped) {
    console.error("[email] Create password email failed", {
      recipient: maskEmailAddress(input.email),
      reason: result.reason,
    });
  }
}
