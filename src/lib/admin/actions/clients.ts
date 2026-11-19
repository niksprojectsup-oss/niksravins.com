"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireClientAccess } from "@/lib/auth/guards";
import {
  ensureClientPortalAccount,
  sendPortalSetupEmailForClient,
} from "@/lib/auth/client-repository";
import { prisma } from "@/lib/db/prisma";
import { initializeClientWorkspace } from "@/lib/admin/client-workspace";
import { sendPortalInviteEmail } from "@/lib/email/send-portal-setup-email";
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
  revalidatePath("/client/dashboard");
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

function deriveNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  const words = local
    .replace(/[._\-+]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1));
  return words.join(" ") || "Client";
}

export async function inviteClientByEmailAction(input: {
  email: string;
  firstName?: string;
  lastName?: string;
}) {
  const session = await requireAdmin();

  const email = (input.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const accountWithEmail = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });
  if (accountWithEmail && accountWithEmail.role !== "CLIENT") {
    return { error: "This email is already used by a non-client account." };
  }

  let client = await prisma.client.findUnique({ where: { email } });
  let createdClient = false;

  if (!client) {
    const firstName = (input.firstName ?? "").trim() || deriveNameFromEmail(email);
    const lastName = (input.lastName ?? "").trim();
    client = await prisma.$transaction(async (tx) => {
      const created = await tx.client.create({
        data: {
          firstName,
          lastName,
          email,
          country: "",
          timezone: "Europe/Riga",
        },
      });
      await initializeClientWorkspace(tx, created.id);
      return created;
    });
    createdClient = true;
  }

  const provisioned = await ensureClientPortalAccount({
    clientId: client.id,
    email: client.email.trim().toLowerCase(),
  });
  if (!provisioned) {
    return { error: "Unable to prepare the portal account." };
  }
  if (provisioned.passwordAlreadySet) {
    return { error: "This client already has an active portal account." };
  }
  if (!provisioned.setupToken) {
    return { error: "Unable to create the portal setup link." };
  }

  const sent = await sendPortalInviteEmail({
    firstName: client.firstName,
    email: client.email,
    setupToken: provisioned.setupToken,
    clientId: client.id,
  });
  if (!sent.ok) {
    return { error: sent.reason ?? "Unable to send the invitation email." };
  }

  await logAuditEvent({
    action: "client.update",
    resource: "client",
    resourceId: client.id,
    actorAdminId: session.id,
    actorRole: session.role,
    metadata: { event: "portal_invite_sent", email: client.email, createdClient },
  });

  revalidatePath("/admin/clients");
  return { success: true as const, clientId: client.id, createdClient };
}

export async function resendPortalSetupEmailAction(clientId: string) {
  await requireClientAccess(clientId);

  const result = await sendPortalSetupEmailForClient(clientId);

  if (!result.ok) {
    if (result.skipped && result.reason === "password_already_set") {
      return { error: "This client already has a portal password." };
    }
    return {
      error: result.reason ?? "Unable to send portal setup email.",
    };
  }

  return { success: true as const, providerId: result.providerId };
}
