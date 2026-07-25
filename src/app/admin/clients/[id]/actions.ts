"use server";

import { revalidatePath } from "next/cache";
import {
  addSessionNote,
  updateChecklistItem,
  updatePractitionerNotes,
  updateReactionAnalysis,
} from "@/lib/admin/client-repository";
import type {
  ChecklistUpdatePayload,
  ReactionAnalysisInput,
  SessionNoteInput,
} from "@/lib/admin/client-types";

export async function saveReactionAnalysisAction(
  clientId: string,
  data: ReactionAnalysisInput,
) {
  await updateReactionAnalysis(clientId, data);
  revalidatePath(`/admin/clients/${clientId}`);
}

export async function saveChecklistItemAction(
  clientId: string,
  payload: ChecklistUpdatePayload,
) {
  await updateChecklistItem(clientId, payload);
  revalidatePath(`/admin/clients/${clientId}`);
}

export async function savePractitionerNotesAction(clientId: string, notes: string) {
  await updatePractitionerNotes(clientId, notes);
  revalidatePath(`/admin/clients/${clientId}`);
}

export async function addSessionNoteAction(clientId: string, input: SessionNoteInput) {
  await addSessionNote(clientId, input);
  revalidatePath(`/admin/clients/${clientId}`);
}
