import {
  BEFORE_CHECKLIST_ITEMS,
  CURRENT_CHECKLIST_ITEMS,
} from "@/lib/admin/client-constants";
import { mapSessionPackageRecord } from "@/lib/admin/package-repository";
import { prisma, requireDatabase } from "@/lib/db/prisma";
import { formatSlotDate, formatSlotTime } from "@/lib/booking/timezone";

export type PortalSession = {
  id: string;
  sessionType: string;
  scheduledAt: string;
  status: string;
  sessionNumber: number | null;
};

export type PortalPackageSummary = {
  id: string;
  serviceTitle: string;
  totalSessions: number;
  completedSessions: number;
  remainingSessions: number;
  status: string;
};

export type PortalDashboard = {
  firstName: string;
  lastName: string;
  email: string;
  nextSession: PortalSession | null;
  previousSessions: PortalSession[];
  packages: PortalPackageSummary[];
  progressSummary: {
    currentChecked: number;
    currentTotal: number;
    highlights: string[];
  };
};

function mapSession(session: {
  id: string;
  sessionType: string;
  scheduledAt: Date;
  status: string;
  sessionNumber: number | null;
}): PortalSession {
  return {
    id: session.id,
    sessionType: session.sessionType,
    scheduledAt: session.scheduledAt.toISOString(),
    status: session.status,
    sessionNumber: session.sessionNumber,
  };
}

export async function getClientPortalDashboard(
  clientId: string,
): Promise<PortalDashboard | null> {
  requireDatabase();

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      sessions: { orderBy: { scheduledAt: "desc" } },
      checklists: true,
      sessionPackages: {
        include: {
          sessions: {
            where: { status: { not: "CANCELLED" } },
            orderBy: { sessionNumber: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client) return null;

  const now = Date.now();
  const sessions = client.sessions.map(mapSession);

  const nextSession =
    sessions
      .filter(
        (session) =>
          session.status === "SCHEDULED" &&
          new Date(session.scheduledAt).getTime() > now,
      )
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      )[0] ?? null;

  const previousSessions = sessions
    .filter((session) => session.id !== nextSession?.id)
    .filter(
      (session) =>
        session.status !== "SCHEDULED" ||
        new Date(session.scheduledAt).getTime() <= now,
    )
    .slice(0, 8);

  const currentState = Object.fromEntries(
    client.checklists
      .filter((item) => item.type === "CURRENT")
      .map((item) => [item.itemKey, item.checked]),
  );

  const highlights = CURRENT_CHECKLIST_ITEMS.filter(
    (item) => currentState[item.key],
  ).map((item) => item.label);

  const packages = client.sessionPackages.map(mapSessionPackageRecord);

  return {
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    nextSession,
    previousSessions,
    packages: packages.map((pkg) => ({
      id: pkg.id,
      serviceTitle: pkg.serviceTitle,
      totalSessions: pkg.totalSessions,
      completedSessions: pkg.completedSessions,
      remainingSessions: pkg.remainingSessions,
      status: pkg.status,
    })),
    progressSummary: {
      currentChecked: highlights.length,
      currentTotal: CURRENT_CHECKLIST_ITEMS.length,
      highlights,
    },
  };
}

export function formatPortalSessionDateTime(
  iso: string,
  timezone: string,
): string {
  return `${formatSlotDate(iso, timezone)} · ${formatSlotTime(iso, timezone)}`;
}

export { BEFORE_CHECKLIST_ITEMS, CURRENT_CHECKLIST_ITEMS };
