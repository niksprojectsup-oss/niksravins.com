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
  ClientListSort,
  ClientSessionNote,
  ClientUpdateInput,
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
import type { ChecklistType, ClientStatus } from "@prisma/client";

function computeSessionDates(
  sessions: { scheduledAt: Date; status: string }[],
  now = new Date(),
) {
  const past = sessions
    .filter(
      (session) =>
        session.status === "COMPLETED" || session.scheduledAt.getTime() <= now.getTime(),
    )
    .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());

  const upcoming = sessions
    .filter(
      (session) =>
        session.status === "SCHEDULED" && session.scheduledAt.getTime() > now.getTime(),
    )
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

  return {
    lastSessionAt: past[0]?.scheduledAt.toISOString() ?? null,
    nextSessionAt: upcoming[0]?.scheduledAt.toISOString() ?? null,
  };
}

function sortClientList(items: ClientListItem[], sort: ClientListSort): ClientListItem[] {
  const rows = [...items];

  switch (sort) {
    case "newest":
      return rows.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case "last_session":
      return rows.sort((a, b) => {
        if (!a.lastSessionAt && !b.lastSessionAt) return 0;
        if (!a.lastSessionAt) return 1;
        if (!b.lastSessionAt) return -1;
        return new Date(b.lastSessionAt).getTime() - new Date(a.lastSessionAt).getTime();
      });
    case "next_session":
      return rows.sort((a, b) => {
        if (!a.nextSessionAt && !b.nextSessionAt) return 0;
        if (!a.nextSessionAt) return 1;
        if (!b.nextSessionAt) return -1;
        return new Date(a.nextSessionAt).getTime() - new Date(b.nextSessionAt).getTime();
      });
    case "alphabetical":
    default:
      return rows.sort((a, b) => {
        const last = a.lastName.localeCompare(b.lastName);
        if (last !== 0) return last;
        return a.firstName.localeCompare(b.firstName);
      });
  }
}

function filterClientList(items: ClientListItem[], search?: string): ClientListItem[] {
  const query = search?.trim().toLowerCase();
  if (!query) return items;

  return items.filter(
    (client) =>
      client.firstName.toLowerCase().includes(query) ||
      client.lastName.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query),
  );
}

function mapClientListItem(client: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  timezone: string;
  status: ClientStatus;
  createdAt: Date;
  sessions: { scheduledAt: Date; status: string }[];
  payments: { status: string }[];
  _count: { sessions: number };
}): ClientListItem {
  const { lastSessionAt, nextSessionAt } = computeSessionDates(client.sessions);

  return {
    id: client.id,
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    country: client.country,
    timezone: client.timezone,
    sessionsCount: client._count.sessions,
    lastSessionAt,
    nextSessionAt,
    paymentStatus: (client.payments[0]?.status.toLowerCase() ?? "pending") as
      | "pending"
      | "paid"
      | "failed"
      | "refunded",
    createdAt: client.createdAt.toISOString(),
    status: client.status,
  };
}

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

export async function listClientRecords(options?: {
  search?: string;
  sort?: ClientListSort;
}): Promise<ClientListItem[]> {
  const sort = options?.sort ?? "alphabetical";

  if (isDatabaseConfigured()) {
    try {
      const clients = await prisma.client.findMany({
        include: {
          sessions: { select: { scheduledAt: true, status: true } },
          payments: { orderBy: { createdAt: "desc" }, take: 1 },
          _count: { select: { sessions: true } },
        },
      });

      const mapped = clients.map(mapClientListItem);
      return sortClientList(filterClientList(mapped, options?.search), sort);
    } catch {
      // Fall through to mock data.
    }
  }

  const mockClients = getMockClientList().map((client) => ({
    ...client,
    nextSessionAt: null,
  }));

  return sortClientList(filterClientList(mockClients, options?.search), sort);
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

export async function updateClientRecord(
  clientId: string,
  input: ClientUpdateInput,
): Promise<ClientWorkspace | null> {
  const normalizedEmail = input.email.trim().toLowerCase();

  if (isDatabaseConfigured()) {
    try {
      await prisma.client.update({
        where: { id: clientId },
        data: {
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          email: normalizedEmail,
          country: input.country,
          timezone: input.timezone,
        },
      });
      return getClientWorkspace(clientId);
    } catch {
      return null;
    }
  }

  const workspace = mockClientWorkspaces[clientId];
  if (!workspace) return null;

  workspace.firstName = input.firstName.trim();
  workspace.lastName = input.lastName.trim();
  workspace.email = normalizedEmail;
  workspace.country = input.country;
  workspace.timezone = input.timezone;
  return workspace;
}

export async function archiveClientRecord(clientId: string): Promise<boolean> {
  if (isDatabaseConfigured()) {
    try {
      await prisma.client.update({
        where: { id: clientId },
        data: { status: "ARCHIVED" },
      });
      return true;
    } catch {
      return false;
    }
  }

  const workspace = mockClientWorkspaces[clientId];
  if (!workspace) return false;
  workspace.status = "ARCHIVED";
  return true;
}

export async function deleteClientRecord(clientId: string): Promise<boolean> {
  if (isDatabaseConfigured()) {
    try {
      await prisma.client.delete({ where: { id: clientId } });
      return true;
    } catch {
      return false;
    }
  }

  delete mockClientWorkspaces[clientId];
  return true;
}
