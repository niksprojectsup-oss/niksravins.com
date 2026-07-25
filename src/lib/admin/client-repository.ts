import {
  BEFORE_CHECKLIST_ITEMS,
  CURRENT_CHECKLIST_ITEMS,
} from "./client-constants";
import {
  getMockClientList,
  getMockClientWorkspace,
  mockClientWorkspaces,
} from "./mock-client-workspaces";
import type {
  ChecklistInput,
  ChecklistUpdatePayload,
  ClientListItem,
  ClientSessionNote,
  ClientWorkspace,
  ReactionAnalysisInput,
  SessionNoteInput,
} from "./client-types";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import {
  decryptField,
  decryptFields,
  encryptField,
  encryptFields,
  SENSITIVE_FIELD_GROUPS,
} from "@/lib/security/encryption";
import type { ChecklistType } from "@prisma/client";

function mapChecklist(items: { itemKey: string; checked: boolean; type: ChecklistType }[]) {
  const before = Object.fromEntries(
    BEFORE_CHECKLIST_ITEMS.map((item) => [item.key, false]),
  );
  const current = Object.fromEntries(
    CURRENT_CHECKLIST_ITEMS.map((item) => [item.key, false]),
  );

  items.forEach((item) => {
    if (item.type === "BEFORE") before[item.itemKey] = item.checked;
    if (item.type === "CURRENT") current[item.itemKey] = item.checked;
  });

  return { before, current };
}

async function getClientWorkspaceFromDb(id: string): Promise<ClientWorkspace | null> {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      profile: true,
      reactionAnalysis: true,
      checklists: true,
      sessions: { orderBy: { scheduledAt: "desc" } },
    },
  });

  if (!client) return null;

  const reactionAnalysis = client.reactionAnalysis
    ? decryptFields(
        {
          mainConcern: client.reactionAnalysis.mainConcern,
          triggers: client.reactionAnalysis.triggers,
          automaticReactions: client.reactionAnalysis.automaticReactions,
          bodySensations: client.reactionAnalysis.bodySensations,
          emotionalResponses: client.reactionAnalysis.emotionalResponses,
          oldPatterns: client.reactionAnalysis.oldPatterns,
          currentResponses: client.reactionAnalysis.currentResponses,
          notes: client.reactionAnalysis.notes,
        },
        SENSITIVE_FIELD_GROUPS.reactionAnalysis,
      )
    : {
        mainConcern: "",
        triggers: "",
        automaticReactions: "",
        bodySensations: "",
        emotionalResponses: "",
        oldPatterns: "",
        currentResponses: "",
        notes: "",
      };

  return {
    id: client.id,
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    country: client.country,
    timezone: client.timezone,
    status: client.status,
    firstSessionDate: client.firstSessionDate?.toISOString() ?? null,
    reactionAnalysis,
    checklist: mapChecklist(client.checklists),
    sessionNotes: client.sessions.map((session) => ({
      id: session.id,
      scheduledAt: session.scheduledAt.toISOString(),
      sessionType: session.sessionType,
      mainTopic: session.mainTopic,
      notes: decryptField(session.notes),
      changesNoticed: decryptField(session.changesNoticed),
      nextFocus: decryptField(session.nextFocus),
      status: session.status,
    })),
    practitionerNotes: decryptField(client.profile?.practitionerNotes ?? ""),
  };
}

export async function getClientWorkspace(id: string): Promise<ClientWorkspace | null> {
  if (isDatabaseConfigured()) {
    try {
      const workspace = await getClientWorkspaceFromDb(id);
      if (workspace) return workspace;
    } catch {
      // Fall through to mock data when database is unavailable.
    }
  }

  return getMockClientWorkspace(id);
}

export async function listClientRecords(): Promise<ClientListItem[]> {
  if (isDatabaseConfigured()) {
    try {
      const clients = await prisma.client.findMany({
        include: {
          sessions: { orderBy: { scheduledAt: "desc" }, take: 1 },
          payments: { orderBy: { createdAt: "desc" }, take: 1 },
          _count: { select: { sessions: true } },
        },
        orderBy: { lastName: "asc" },
      });

      return clients.map((client) => ({
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        country: client.country,
        timezone: client.timezone,
        sessionsCount: client._count.sessions,
        lastSessionAt: client.sessions[0]?.scheduledAt.toISOString() ?? null,
        paymentStatus: (client.payments[0]?.status.toLowerCase() ?? "pending") as
          | "pending"
          | "paid"
          | "failed"
          | "refunded",
        createdAt: client.createdAt.toISOString(),
        status: client.status,
      }));
    } catch {
      // Fall through to mock data.
    }
  }

  return getMockClientList();
}

export async function updateReactionAnalysis(
  clientId: string,
  data: ReactionAnalysisInput,
): Promise<ClientWorkspace | null> {
  if (isDatabaseConfigured()) {
    try {
      const encrypted = encryptFields(data, SENSITIVE_FIELD_GROUPS.reactionAnalysis);
      await prisma.reactionAnalysis.upsert({
        where: { clientId },
        create: { clientId, ...encrypted },
        update: encrypted,
      });
      return getClientWorkspace(clientId);
    } catch {
      // Fall through to mock.
    }
  }

  const workspace = mockClientWorkspaces[clientId];
  if (!workspace) return null;
  workspace.reactionAnalysis = data;
  return workspace;
}

export async function updateChecklistItem(
  clientId: string,
  payload: ChecklistUpdatePayload,
): Promise<ClientWorkspace | null> {
  if (isDatabaseConfigured()) {
    try {
      await prisma.checklist.upsert({
        where: {
          clientId_type_itemKey: {
            clientId,
            type: payload.type,
            itemKey: payload.itemKey,
          },
        },
        create: {
          clientId,
          type: payload.type,
          itemKey: payload.itemKey,
          checked: payload.checked,
        },
        update: { checked: payload.checked },
      });
      return getClientWorkspace(clientId);
    } catch {
      // Fall through to mock.
    }
  }

  const workspace = mockClientWorkspaces[clientId];
  if (!workspace) return null;

  const bucket = payload.type === "BEFORE" ? workspace.checklist.before : workspace.checklist.current;
  bucket[payload.itemKey] = payload.checked;
  return workspace;
}

export async function updatePractitionerNotes(
  clientId: string,
  notes: string,
): Promise<ClientWorkspace | null> {
  if (isDatabaseConfigured()) {
    try {
      await prisma.clientProfile.upsert({
        where: { clientId },
        create: { clientId, practitionerNotes: encryptField(notes) },
        update: { practitionerNotes: encryptField(notes) },
      });
      return getClientWorkspace(clientId);
    } catch {
      // Fall through to mock.
    }
  }

  const workspace = mockClientWorkspaces[clientId];
  if (!workspace) return null;
  workspace.practitionerNotes = notes;
  return workspace;
}

export async function addSessionNote(
  clientId: string,
  input: SessionNoteInput,
): Promise<ClientSessionNote | null> {
  if (isDatabaseConfigured()) {
    try {
      const session = await prisma.session.create({
        data: {
          clientId,
          scheduledAt: new Date(input.scheduledAt),
          sessionType: input.sessionType,
          mainTopic: input.mainTopic,
          notes: encryptField(input.notes),
          changesNoticed: encryptField(input.changesNoticed),
          nextFocus: encryptField(input.nextFocus),
          status: "COMPLETED",
        },
      });

      return {
        id: session.id,
        scheduledAt: session.scheduledAt.toISOString(),
        sessionType: session.sessionType,
        mainTopic: session.mainTopic,
        notes: input.notes,
        changesNoticed: input.changesNoticed,
        nextFocus: input.nextFocus,
        status: session.status,
      };
    } catch {
      // Fall through to mock.
    }
  }

  const workspace = mockClientWorkspaces[clientId];
  if (!workspace) return null;

  const note: ClientSessionNote = {
    id: `ses_${Date.now()}`,
    ...input,
    status: "COMPLETED",
  };
  workspace.sessionNotes.unshift(note);
  return note;
}

export async function replaceChecklistState(
  clientId: string,
  checklist: ChecklistInput,
): Promise<ClientWorkspace | null> {
  const workspace = mockClientWorkspaces[clientId];
  if (workspace) workspace.checklist = checklist;
  return workspace ?? getClientWorkspace(clientId);
}
