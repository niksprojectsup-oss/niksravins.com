/**
 * Future email reminder hooks — not sent in this release.
 * @see requirements section 19
 */
export type JourneyEmailReminderKind =
  | "check_in"
  | "session_preparation"
  | "post_session_reflection"
  | "final_reflection";

export async function scheduleJourneyEmailReminder(
  _kind: JourneyEmailReminderKind,
  _clientId: string,
  _context?: Record<string, string>,
): Promise<void> {
  // TODO: integrate with email service when reminder cadence is defined
}
