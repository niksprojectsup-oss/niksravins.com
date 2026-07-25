"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireClientAccess } from "@/lib/auth/guards";
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
import { logAuditEvent } from "@/lib/security/audit";

export async function saveReactionAnalysisAction(
  clientId: string,
  data: ReactionAnalysisInput,
) {
  const session = await requireClientAccess(clientId);
  await updateReactionAnalysis(clientId, data);
  await logAuditEvent({
    action: "reaction_analysis.update",
    resource: "reaction_analysis",
    resourceId: clientId,
    actorAdminId: session.id,
    actorRole: session.role,
  });
  revalidatePath(`/admin/clients/${clientId}`);
}

export async function saveChecklistItemAction(
  clientId: string,
  payload: ChecklistUpdatePayload,
) {
  const session = await requireClientAccess(clientId);
  await updateChecklistItem(clientId, payload);
  await logAuditEvent({
    action: "client.update",
    resource: "client",
    resourceId: clientId,
    actorAdminId: session.id,
    actorRole: session.role,
    metadata: { section: "checklist", itemKey: payload.itemKey },
  });
  revalidatePath(`/admin/clients/${clientId}`);
}

export async function savePractitionerNotesAction(clientId: string, notes: string) {
  const session = await requireAdmin();
  await updatePractitionerNotes(clientId, notes);
  await logAuditEvent({
    action: "practitioner_notes.update",
    resource: "practitioner_notes",
    resourceId: clientId,
    actorAdminId: session.id,
    actorRole: session.role,
  });
  revalidatePath(`/admin/clients/${clientId}`);
}

export async function addSessionNoteAction(clientId: string, input: SessionNoteInput) {
  const session = await requireAdmin();
  await addSessionNote(clientId, input);
  await logAuditEvent({
    action: "session.create",
    resource: "session",
    resourceId: clientId,
    actorAdminId: session.id,
    actorRole: session.role,
  });
  revalidatePath(`/admin/clients/${clientId}`);
}
