type EmailLogContext = {
  bookingId: string;
  recipientRole: "client" | "admin";
  recipientDomain: string;
};

function extractEmailDomain(email: string): string {
  const atIndex = email.lastIndexOf("@");
  if (atIndex === -1) {
    return "invalid";
  }
  return email.slice(atIndex + 1).toLowerCase();
}

export function logEmailFailure(
  error: unknown,
  context: EmailLogContext,
): void {
  const message =
    error instanceof Error ? error.message : "Unknown email delivery error";

  console.error("[booking-email] Delivery failed", {
    bookingId: context.bookingId,
    recipientRole: context.recipientRole,
    recipientDomain: context.recipientDomain,
    error: message,
  });
}

export function logEmailSkipped(reason: string, bookingId: string): void {
  console.warn("[booking-email] Skipped", { bookingId, reason });
}

export function recipientDomainFromEmail(email: string): string {
  return extractEmailDomain(email);
}
