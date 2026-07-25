import type {
  AdminClient,
  AdminPayment,
  AdminSession,
  CalendarSlot,
  DashboardStats,
} from "./types";

export const mockDashboardStats: DashboardStats = {
  upcomingCount: 4,
  todayCount: 1,
  weekCount: 6,
  revenueCents: 124000,
  currency: "EUR",
};

export const mockClients: AdminClient[] = [
  {
    id: "cl_001",
    firstName: "Anna",
    lastName: "Kalniņa",
    email: "anna.k@example.com",
    country: "Latvia",
    timezone: "Europe/Riga",
    sessionsCount: 3,
    lastSessionAt: "2026-07-18T09:00:00.000Z",
    paymentStatus: "paid",
    createdAt: "2026-05-10T10:00:00.000Z",
  },
  {
    id: "cl_002",
    firstName: "James",
    lastName: "Whitmore",
    email: "j.whitmore@example.com",
    country: "United Kingdom",
    timezone: "Europe/London",
    sessionsCount: 1,
    lastSessionAt: "2026-07-22T11:00:00.000Z",
    paymentStatus: "pending",
    createdAt: "2026-07-15T14:30:00.000Z",
  },
  {
    id: "cl_003",
    firstName: "Sofia",
    lastName: "Marin",
    email: "sofia.m@example.com",
    country: "Germany",
    timezone: "Europe/Berlin",
    sessionsCount: 5,
    lastSessionAt: "2026-07-24T14:00:00.000Z",
    paymentStatus: "paid",
    createdAt: "2026-04-02T09:00:00.000Z",
  },
];

export const mockSessions: AdminSession[] = [
  {
    id: "ses_001",
    clientId: "cl_001",
    clientName: "Anna Kalniņa",
    scheduledAt: "2026-07-26T09:00:00.000Z",
    serviceId: "initial-aap-session",
    serviceTitle: "Initial AAP Session",
    status: "scheduled",
    notes: "Focus on anxiety before speaking.",
  },
  {
    id: "ses_002",
    clientId: "cl_002",
    clientName: "James Whitmore",
    scheduledAt: "2026-07-26T11:00:00.000Z",
    serviceId: "initial-aap-session",
    serviceTitle: "Initial AAP Session",
    status: "scheduled",
    notes: "",
  },
  {
    id: "ses_003",
    clientId: "cl_003",
    clientName: "Sofia Marin",
    scheduledAt: "2026-07-28T14:00:00.000Z",
    serviceId: "aap-transformation-package",
    serviceTitle: "AAP Transformation Package",
    status: "scheduled",
    notes: "Session 3 of package.",
  },
  {
    id: "ses_004",
    clientId: "cl_001",
    clientName: "Anna Kalniņa",
    scheduledAt: "2026-07-18T09:00:00.000Z",
    serviceId: "initial-aap-session",
    serviceTitle: "Initial AAP Session",
    status: "completed",
    notes: "Strong shift in pre-meeting tension.",
  },
];

export const mockPayments: AdminPayment[] = [
  {
    id: "pay_001",
    clientId: "cl_001",
    clientName: "Anna Kalniņa",
    sessionId: "ses_004",
    sessionLabel: "Initial AAP Session · 18 Jul",
    amountCents: 18000,
    currency: "EUR",
    status: "paid",
    provider: "stripe",
    createdAt: "2026-07-17T10:00:00.000Z",
  },
  {
    id: "pay_002",
    clientId: "cl_002",
    clientName: "James Whitmore",
    sessionId: "ses_002",
    sessionLabel: "Initial AAP Session · 26 Jul",
    amountCents: 18000,
    currency: "EUR",
    status: "pending",
    createdAt: "2026-07-22T16:00:00.000Z",
  },
  {
    id: "pay_003",
    clientId: "cl_003",
    clientName: "Sofia Marin",
    sessionId: "ses_003",
    sessionLabel: "AAP Transformation Package · 28 Jul",
    amountCents: 88000,
    currency: "EUR",
    status: "paid",
    provider: "stripe",
    createdAt: "2026-07-20T09:00:00.000Z",
  },
];

function buildMonthSlots(year: number, month: number): CalendarSlot[] {
  const slots: CalendarSlot[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dateStr = date.toISOString().slice(0, 10);
    const hours = [9, 11, 14, 16];

    hours.forEach((hour, index) => {
      const start = new Date(date);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + 90);

      const isBooked = (day + index) % 4 === 0;
      const bookedClient = isBooked ? mockClients[index % mockClients.length] : null;
      slots.push({
        id: `${dateStr}-${hour}`,
        date: dateStr,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        kind: isBooked ? "booked" : "available",
        sessionId: isBooked ? `ses_mock_${dateStr}_${hour}` : undefined,
        clientName: bookedClient
          ? `${bookedClient.firstName} ${bookedClient.lastName.charAt(0)}.`
          : undefined,
      });
    });
  }

  return slots;
}

/** Mock calendar data keyed by YYYY-MM. Replace with AdminDataService. */
export function getMockCalendarSlots(monthKey: string): CalendarSlot[] {
  const [year, month] = monthKey.split("-").map(Number);
  return buildMonthSlots(year, month - 1);
}

export function formatAdminDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatAdminDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatCurrency(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(cents / 100);
}
