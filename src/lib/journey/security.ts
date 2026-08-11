import type { JournalVisibility } from "@prisma/client";

export type JournalEntryLike = {
  id: string;
  clientId: string;
  visibility: JournalVisibility;
  content: string;
};

/** Admin payloads must never include PRIVATE journal entries */
export function filterJournalEntriesForAdmin<T extends JournalEntryLike>(
  entries: T[],
  requestingClientId: string,
): T[] {
  return entries.filter(
    (entry) => entry.clientId === requestingClientId && entry.visibility === "SHARED",
  );
}

export function assertJournalEntryOwnedBy(
  entry: JournalEntryLike | null | undefined,
  clientId: string,
): boolean {
  return Boolean(entry && entry.clientId === clientId);
}

export function canCreateCheckInForDate(
  existingDate: string | null,
  targetDate: string,
  isUpdate: boolean,
): boolean {
  if (isUpdate) return true;
  return existingDate !== targetDate;
}
