import { maskEmailAddress, sendEmail } from "./client";
import { logEmailAttempt } from "./logging";
import { buildPackageSessionConfirmationEmail } from "./templates/package-session-confirmation";

export async function sendPackageSessionConfirmationEmail(input: {
  clientFirstName: string;
  clientEmail: string;
  clientTimezone: string;
  sessionNumber: number;
  totalSessions: number;
  scheduledAt: string;
  packageId: string;
  sessionId: string;
}): Promise<void> {
  const message = buildPackageSessionConfirmationEmail({
    clientFirstName: input.clientFirstName,
    clientTimezone: input.clientTimezone,
    sessionNumber: input.sessionNumber,
    totalSessions: input.totalSessions,
    scheduledAt: input.scheduledAt,
  });

  logEmailAttempt({
    kind: "package_session_confirmation",
    recipient: input.clientEmail,
    subject: message.subject,
    context: {
      packageId: input.packageId,
      sessionId: input.sessionId,
      sessionNumber: String(input.sessionNumber),
    },
  });

  await sendEmail(
    {
      to: input.clientEmail,
      subject: message.subject,
      html: message.html,
      text: message.text,
    },
    {
      kind: "package_session_confirmation",
      context: {
        packageId: input.packageId,
        sessionId: input.sessionId,
        sessionNumber: String(input.sessionNumber),
        recipient: maskEmailAddress(input.clientEmail),
      },
    },
  );
}
