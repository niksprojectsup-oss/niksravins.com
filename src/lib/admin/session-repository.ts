import { getMockAvailability } from "@/lib/booking/mock-availability";
import { getServiceDurationMinutes } from "@/lib/booking/services-catalog";
import type { ServiceId } from "@/lib/booking/types";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { formatAdminDateTime, getMockCalendarSlots } from "@/lib/admin/mock-data";
import type { AdminSession, CalendarSlot, DashboardStats } from "@/lib/admin/types";
import type { SessionStatus } from "@prisma/client";

function mapSessionStatus(status: SessionStatus): AdminSession["status"] {
  switch (status) {
    case "SCHEDULED":
      return "scheduled";
    case "COMPLETED":
      return "completed";
    case "CANCELLED":
      return "cancelled";
    case "NO_SHOW":
      return "no-show";
    default:
      return "scheduled";
  }
}

function getMonthRange(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

export async function listAdminSessions(): Promise<AdminSession[]> {
  if (!isDatabaseConfigured()) {
    const { mockSessions } = await import("@/lib/admin/mock-data");
    return mockSessions;
  }

  try {
    const sessions = await prisma.session.findMany({
      include: {
        client: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { scheduledAt: "desc" },
    });

    return sessions.map((session) => ({
      id: session.id,
      clientId: session.clientId,
      clientName: `${session.client.firstName} ${session.client.lastName}`,
      scheduledAt: session.scheduledAt.toISOString(),
      serviceId: (session.serviceId ?? "initial-aap-session") as ServiceId,
      serviceTitle: session.sessionType,
      status: mapSessionStatus(session.status),
      notes: session.mainTopic || session.notes,
    }));
  } catch {
    const { mockSessions } = await import("@/lib/admin/mock-data");
    return mockSessions;
  }
}

export async function getAdminCalendarSlots(monthKey: string): Promise<CalendarSlot[]> {
  const { start, end } = getMonthRange(monthKey);

  if (!isDatabaseConfigured()) {
    return getMockCalendarSlots(monthKey);
  }

  try {
    const sessions = await prisma.session.findMany({
      where: {
        scheduledAt: { gte: start, lte: end },
        status: { in: ["SCHEDULED", "COMPLETED"] },
      },
      include: {
        client: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { scheduledAt: "asc" },
    });

    const bookedSlots: CalendarSlot[] = sessions.map((session) => {
      const startTime = session.scheduledAt;
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 90);

      return {
        id: session.id,
        date: startTime.toISOString().slice(0, 10),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        kind: "booked",
        sessionId: session.id,
        clientName: `${session.client.firstName} ${session.client.lastName.charAt(0)}.`,
      };
    });

    const mockAvailable = getMockCalendarSlots(monthKey).filter(
      (slot) => slot.kind === "available",
    );

    const bookedTimes = new Set(bookedSlots.map((slot) => slot.startTime));
    const availableSlots = mockAvailable.filter(
      (slot) => !bookedTimes.has(slot.startTime),
    );

    return [...bookedSlots, ...availableSlots].sort((a, b) =>
      a.startTime.localeCompare(b.startTime),
    );
  } catch {
    return getMockCalendarSlots(monthKey);
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!isDatabaseConfigured()) {
    const { mockDashboardStats } = await import("@/lib/admin/mock-data");
    return mockDashboardStats;
  }

  try {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const [upcomingCount, todayCount, weekCount, paidPayments] = await Promise.all([
      prisma.session.count({
        where: { status: "SCHEDULED", scheduledAt: { gte: now } },
      }),
      prisma.session.count({
        where: {
          status: "SCHEDULED",
          scheduledAt: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.session.count({
        where: {
          status: "SCHEDULED",
          scheduledAt: { gte: startOfWeek, lte: endOfWeek },
        },
      }),
      prisma.payment.findMany({
        where: { status: "PAID" },
        select: { amountCents: true, currency: true },
      }),
    ]);

    const revenueCents = paidPayments.reduce((sum, payment) => sum + payment.amountCents, 0);

    return {
      upcomingCount,
      todayCount,
      weekCount,
      revenueCents,
      currency: paidPayments[0]?.currency ?? "EUR",
    };
  } catch {
    const { mockDashboardStats } = await import("@/lib/admin/mock-data");
    return mockDashboardStats;
  }
}

export async function getUpcomingSessions(limit = 4): Promise<AdminSession[]> {
  const sessions = await listAdminSessions();
  const now = Date.now();

  return sessions
    .filter((session) => session.status === "scheduled" && new Date(session.scheduledAt).getTime() >= now)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
    .slice(0, limit);
}

export async function getSessionsForDay(datePrefix: string): Promise<AdminSession[]> {
  const sessions = await listAdminSessions();
  return sessions.filter((session) => session.scheduledAt.startsWith(datePrefix));
}

export { formatAdminDateTime };
