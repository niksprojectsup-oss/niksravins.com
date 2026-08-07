import { getServiceDurationMinutes } from "@/lib/booking/services-catalog";
import type { ServiceId } from "@/lib/booking/types";
import { formatAdminDateTime } from "@/lib/admin/format";
import { prisma, requireDatabase } from "@/lib/db/prisma";
import type { AdminPayment, AdminSession, CalendarSlot, DashboardStats } from "@/lib/admin/types";
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
  requireDatabase();

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
}

export async function listAdminPayments(): Promise<AdminPayment[]> {
  requireDatabase();

  const payments = await prisma.payment.findMany({
    include: {
      client: { select: { firstName: true, lastName: true } },
      session: { select: { sessionType: true, scheduledAt: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return payments.map((payment) => ({
    id: payment.id,
    clientId: payment.clientId,
    clientName: `${payment.client.firstName} ${payment.client.lastName}`,
    sessionId: payment.sessionId ?? "",
    sessionLabel: payment.session
      ? `${payment.session.sessionType} · ${formatAdminDateTime(payment.session.scheduledAt.toISOString())}`
      : "—",
    amountCents: payment.amountCents,
    currency: payment.currency,
    status: payment.status.toLowerCase() as AdminPayment["status"],
    provider: payment.provider?.toLowerCase() as AdminPayment["provider"] | undefined,
    createdAt: payment.createdAt.toISOString(),
  }));
}

export async function getAdminCalendarSlots(monthKey: string): Promise<CalendarSlot[]> {
  requireDatabase();
  const { start, end } = getMonthRange(monthKey);

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

  return sessions.map((session) => {
    const startTime = session.scheduledAt;
    const duration = getServiceDurationMinutes(
      (session.serviceId ?? "initial-aap-session") as ServiceId,
    );
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);

    return {
      id: session.id,
      date: startTime.toISOString().slice(0, 10),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      kind: "booked" as const,
      sessionId: session.id,
      clientName: `${session.client.firstName} ${session.client.lastName}`,
      serviceTitle: session.sessionType,
      status: mapSessionStatus(session.status),
    };
  });
}

export async function getDashboardStats(): Promise<DashboardStats> {
  requireDatabase();

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
}

export async function getUpcomingSessions(limit = 4): Promise<AdminSession[]> {
  requireDatabase();
  const now = new Date();

  const sessions = await prisma.session.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { gte: now },
    },
    include: {
      client: { select: { firstName: true, lastName: true } },
    },
    orderBy: { scheduledAt: "asc" },
    take: limit,
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
}

export async function getSessionsForDay(datePrefix: string): Promise<AdminSession[]> {
  requireDatabase();
  const start = new Date(`${datePrefix}T00:00:00.000Z`);
  const end = new Date(`${datePrefix}T23:59:59.999Z`);

  const sessions = await prisma.session.findMany({
    where: {
      scheduledAt: { gte: start, lte: end },
    },
    include: {
      client: { select: { firstName: true, lastName: true } },
    },
    orderBy: { scheduledAt: "asc" },
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
}

export { formatAdminDateTime };
