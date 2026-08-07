"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireClientAccess } from "@/lib/auth/guards";
import {
  addSessionNote,
  archiveClientRecord,
  deleteClientRecord,
  updateChecklistItem,
  updateClientRecord,
  updatePractitionerNotes,
  updateReactionAnalysis,
} from "@/lib/admin/client-repository";
import {
  markSessionCompleted,
  PackageOperationError,
  schedulePackageSession,
} from "@/lib/admin/package-repository";
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

export async function updateClientAction(
  clientId: string,
  input: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    country: string;
    timezone: string;
  },
) {
  const session = await requireAdmin();
  const updated = await updateClientRecord(clientId, input);
  if (!updated) {
    return { error: "Unable to update client." };
  }

  await logAuditEvent({
    action: "client.update",
    resource: "client",
    resourceId: clientId,
    actorAdminId: session.id,
    actorRole: session.role,
  });

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true as const };
}

export async function archiveClientAction(clientId: string) {
  const session = await requireAdmin();
  const archived = await archiveClientRecord(clientId);
  if (!archived) {
    return { error: "Unable to archive client." };
  }

  await logAuditEvent({
    action: "client.update",
    resource: "client",
    resourceId: clientId,
    actorAdminId: session.id,
    actorRole: session.role,
    metadata: { status: "ARCHIVED" },
  });

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true as const };
}

export async function deleteClientAction(clientId: string) {
  const session = await requireAdmin();
  const deleted = await deleteClientRecord(clientId);
  if (!deleted) {
    return { error: "Unable to delete client." };
  }

  await logAuditEvent({
    action: "data.delete",
    resource: "client",
    resourceId: clientId,
    actorAdminId: session.id,
    actorRole: session.role,
  });

  revalidatePath("/admin/clients");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/sessions");
}

export async function schedulePackageSessionAction(
  clientId: string,
  packageId: string,
  scheduledAt: string,
) {
  const session = await requireAdmin();

  try {
    await schedulePackageSession(packageId, scheduledAt);
  } catch (error) {
    if (error instanceof PackageOperationError) {
      return { error: error.message };
    }
    return { error: "Unable to schedule session." };
  }

  await logAuditEvent({
    action: "session.create",
    resource: "session_package",
    resourceId: packageId,
    actorAdminId: session.id,
    actorRole: session.role,
    metadata: { clientId },
  });

  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/sessions");
  revalidatePath("/admin");
  return { success: true as const };
}

export async function markSessionCompletedAction(
  clientId: string,
  sessionId: string,
) {
  const session = await requireAdmin();

  try {
    await markSessionCompleted(sessionId);
  } catch (error) {
    if (error instanceof PackageOperationError) {
      return { error: error.message };
    }
    return { error: "Unable to mark session completed." };
  }

  await logAuditEvent({
    action: "session.update",
    resource: "session",
    resourceId: sessionId,
    actorAdminId: session.id,
    actorRole: session.role,
    metadata: { status: "COMPLETED", clientId },
  });

  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/sessions");
  revalidatePath("/admin");
  return { success: true as const };
}
