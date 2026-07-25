import type { ChecklistItemKey } from "./client-constants";
import type { ClientStatus } from "@prisma/client";

export interface ReactionAnalysisData {
  mainConcern: string;
  triggers: string;
  automaticReactions: string;
  bodySensations: string;
  emotionalResponses: string;
  oldPatterns: string;
  currentResponses: string;
  notes: string;
}

export interface ChecklistState {
  before: Record<string, boolean>;
  current: Record<string, boolean>;
}

export interface ClientSessionNote {
  id: string;
  scheduledAt: string;
  sessionType: string;
  mainTopic: string;
  notes: string;
  changesNoticed: string;
  nextFocus: string;
  status: string;
}

export interface ClientListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  timezone: string;
  sessionsCount: number;
  lastSessionAt: string | null;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  createdAt: string;
  status: string;
}

export interface ClientWorkspace {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  timezone: string;
  status: ClientStatus | string;
  firstSessionDate: string | null;
  reactionAnalysis: ReactionAnalysisData;
  checklist: ChecklistState;
  sessionNotes: ClientSessionNote[];
  practitionerNotes: string;
}

export type ReactionAnalysisInput = ReactionAnalysisData;
export type ChecklistInput = ChecklistState;
export type SessionNoteInput = Omit<ClientSessionNote, "id" | "status">;

export type ChecklistUpdatePayload = {
  type: "BEFORE" | "CURRENT";
  itemKey: ChecklistItemKey;
  checked: boolean;
};
