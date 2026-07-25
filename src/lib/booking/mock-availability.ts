import type { AvailabilityDay, ServiceId, TimeSlot } from "./types";

const SLOT_HOURS = [9, 11, 14, 16];

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function createSlot(date: Date, hour: number, durationMinutes: number): TimeSlot {
  const start = new Date(date);
  start.setHours(hour, 0, 0, 0);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + durationMinutes);

  return {
    id: `${formatDate(date)}-${hour}`,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    available: true,
  };
}

/** Mock availability for Phase 1. Swap for AvailabilityService in production. */
export function getMockAvailability(
  daysAhead = 28,
  durationMinutes = 90,
  _serviceId?: ServiceId,
): AvailabilityDay[] {
  void _serviceId;

  const days: AvailabilityDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= daysAhead; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const slots = SLOT_HOURS.map((hour) =>
      createSlot(date, hour, durationMinutes),
    ).filter((_, index) => (date.getDate() + index) % 5 !== 0);

    if (slots.length > 0) {
      days.push({ date: formatDate(date), slots });
    }
  }

  return days;
}

export function findSlotById(
  availability: AvailabilityDay[],
  slotId: string,
): TimeSlot | undefined {
  for (const day of availability) {
    const slot = day.slots.find((s) => s.id === slotId);
    if (slot) return slot;
  }
  return undefined;
}

export function formatSlotTime(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  }).format(new Date(iso));
}

export function formatSlotDate(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: timezone,
  }).format(new Date(iso));
}
