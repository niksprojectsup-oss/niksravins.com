import {
  BEFORE_CHECKLIST_ITEMS,
  CURRENT_CHECKLIST_ITEMS,
} from "./client-constants";
import type {
  ChecklistInput,
  ChecklistUpdatePayload,
  ClientBookingRecord,
  ClientListItem,
  ClientListSort,
  ClientSessionNote,
  ClientTimelineEvent,
  ClientUpdateInput,
  ClientWorkspace,
  ReactionAnalysisInput,
  SessionNoteInput,
} from "./client-types";
import { getServiceById } from "@/lib/booking/services-catalog";
import { listClientPackages } from "@/lib/admin/package-repository";
import { prisma, requireDatabase } from "@/lib/db/prisma";
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

function partitionSessions(
  sessions: ClientSessionNote[],
  now = new Date(),
): { upcoming: ClientSessionNote[]; completed: ClientSessionNote[] } {
  const upcoming = sessions
    .filter(
      (session) =>
        session.status === "SCHEDULED" &&
        new Date(session.scheduledAt).getTime() > now.getTime(),
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );

  const completed = sessions
    .filter(
      (session) =>
        session.status === "COMPLETED" ||
        session.status === "NO_SHOW" ||
        session.status === "CANCELLED" ||
        (session.status === "SCHEDULED" &&
          new Date(session.scheduledAt).getTime() <= now.getTime()),
    )
    .sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    );

  return { upcoming, completed };
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

async function mapBookings(
  bookings: {
    id: string;
    serviceId: string;
    sessionIntention: string;
    status: string;
    createdAt: Date;
    session: { scheduledAt: Date; sessionType: string };
  }[],
): Promise<ClientBookingRecord[]> {
  return Promise.all(
    bookings.map(async (booking) => {
      const service = await getServiceById(booking.serviceId);
      return {
        id: booking.id,
        serviceId: booking.serviceId,
        serviceTitle: service?.title ?? booking.session.sessionType,
        scheduledAt: booking.session.scheduledAt.toISOString(),
        status: booking.status.toLowerCase(),
        sessionIntention: booking.sessionIntention,
        createdAt: booking.createdAt.toISOString(),
      };
    }),
  );
}

function buildTimeline(input: {
  createdAt: Date;
  bookings: ClientBookingRecord[];
  sessions: ClientSessionNote[];
}): ClientTimelineEvent[] {
  const events: ClientTimelineEvent[] = [
    {
      id: "client-created",
      type: "client",
      title: "Client profile created",
      description: "Client entered the system.",
      occurredAt: input.createdAt.toISOString(),
    },
  ];

  input.bookings.forEach((booking) => {
    events.push({
      id: `booking-${booking.id}`,
      type: "booking",
      title: `Booking confirmed · ${booking.serviceTitle}`,
      description: booking.sessionIntention || "Session booked online.",
      occurredAt: booking.createdAt,
    });
  });

  input.sessions.forEach((session) => {
    events.push({
      id: `session-${session.id}`,
      type: "session",
      title: `${session.sessionType} · ${session.status.toLowerCase()}`,
      description: session.mainTopic || session.notes || "Session recorded.",
      occurredAt: session.scheduledAt,
    });
  });

  return events.sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
}

async function getClientWorkspaceFromDb(id: string): Promise<ClientWorkspace | null> {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      profile: true,
      reactionAnalysis: true,
      checklists: true,
      sessions: { orderBy: { scheduledAt: "desc" } },
      bookings: {
        include: { session: true },
        orderBy: { createdAt: "desc" },
      },
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

  const sessionNotes: ClientSessionNote[] = client.sessions.map((session) => ({
    id: session.id,
    scheduledAt: session.scheduledAt.toISOString(),
    sessionType: session.sessionType,
    sessionNumber: session.sessionNumber,
    packageId: session.packageId,
    mainTopic: session.mainTopic,
    notes: decryptField(session.notes),
    changesNoticed: decryptField(session.changesNoticed),
    nextFocus: decryptField(session.nextFocus),
    status: session.status,
  }));

  const { upcoming, completed } = partitionSessions(sessionNotes);
  const bookings = await mapBookings(client.bookings);
  const packages = await listClientPackages(client.id);

  return {
    id: client.id,
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    phone: client.phone,
    country: client.country,
    timezone: client.timezone,
    status: client.status,
    firstSessionDate: client.firstSessionDate?.toISOString() ?? null,
    createdAt: client.createdAt.toISOString(),
    reactionAnalysis,
    checklist: mapChecklist(client.checklists),
    sessionNotes,
    upcomingSessions: upcoming,
    completedSessions: completed,
    packages,
    bookings,
    timeline: buildTimeline({
      createdAt: client.createdAt,
      bookings,
      sessions: sessionNotes,
    }),
    practitionerNotes: decryptField(client.profile?.practitionerNotes ?? ""),
  };
}

export async function getClientWorkspace(id: string): Promise<ClientWorkspace | null> {
  requireDatabase();
  return getClientWorkspaceFromDb(id);
}

export async function listClientRecords(options?: {
  search?: string;
  sort?: ClientListSort;
}): Promise<ClientListItem[]> {
  requireDatabase();
  const sort = options?.sort ?? "alphabetical";

  const clients = await prisma.client.findMany({
    include: {
      sessions: { select: { scheduledAt: true, status: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { sessions: true } },
    },
  });

  const mapped = clients.map(mapClientListItem);
  return sortClientList(filterClientList(mapped, options?.search), sort);
}

export async function updateReactionAnalysis(
  clientId: string,
  data: ReactionAnalysisInput,
): Promise<ClientWorkspace | null> {
  requireDatabase();
  const encrypted = encryptFields(data, SENSITIVE_FIELD_GROUPS.reactionAnalysis);
  await prisma.reactionAnalysis.upsert({
    where: { clientId },
    create: { clientId, ...encrypted },
    update: encrypted,
  });
  return getClientWorkspace(clientId);
}

export async function updateChecklistItem(
  clientId: string,
  payload: ChecklistUpdatePayload,
): Promise<ClientWorkspace | null> {
  requireDatabase();
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
}

export async function updatePractitionerNotes(
  clientId: string,
  notes: string,
): Promise<ClientWorkspace | null> {
  requireDatabase();
  await prisma.clientProfile.upsert({
    where: { clientId },
    create: { clientId, practitionerNotes: encryptField(notes) },
    update: { practitionerNotes: encryptField(notes) },
  });
  return getClientWorkspace(clientId);
}

export async function addSessionNote(
  clientId: string,
  input: SessionNoteInput,
): Promise<ClientSessionNote | null> {
  requireDatabase();
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
}

export async function replaceChecklistState(
  clientId: string,
  checklist: ChecklistInput,
): Promise<ClientWorkspace | null> {
  return getClientWorkspace(clientId);
}

export async function updateClientRecord(
  clientId: string,
  input: ClientUpdateInput,
): Promise<ClientWorkspace | null> {
  requireDatabase();
  const normalizedEmail = input.email.trim().toLowerCase();

  await prisma.client.update({
    where: { id: clientId },
    data: {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: normalizedEmail,
      phone: input.phone?.trim() || null,
      country: input.country,
      timezone: input.timezone,
    },
  });
  return getClientWorkspace(clientId);
}

export async function archiveClientRecord(clientId: string): Promise<boolean> {
  requireDatabase();
  await prisma.client.update({
    where: { id: clientId },
    data: { status: "ARCHIVED" },
  });
  return true;
}

export async function deleteClientRecord(clientId: string): Promise<boolean> {
  requireDatabase();
  await prisma.client.delete({ where: { id: clientId } });
  return true;
}
