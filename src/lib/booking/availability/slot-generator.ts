import { getServiceDurationMinutes } from "@/lib/booking/services-catalog";
import type { AvailabilityDay, ServiceId, TimeSlot } from "@/lib/booking/types";
import {
  addDaysToDateKey,
  getDateKeyInTimeZone,
  getIsoDayOfWeek,
  minutesToTimeKey,
  parseTimeToMinutes,
  zonedLocalToUtc,
} from "@/lib/booking/timezone";
import type { AvailabilityConfig } from "./config-repository";

type BookedSession = {
  scheduledAt: Date;
  durationMinutes: number;
};

function rangesOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
): boolean {
  return startA < endB && endA > startB;
}

function isWithinWorkingWindow(
  startMinutes: number,
  endMinutes: number,
  windowStart: number,
  windowEnd: number,
): boolean {
  return startMinutes >= windowStart && endMinutes <= windowEnd;
}

function overlapsDailyBlock(
  startMs: number,
  endMs: number,
  dateKey: string,
  timeZone: string,
  blocks: AvailabilityConfig["blocks"],
): boolean {
  return blocks.some((block) => {
    if (!block.active) return false;

    const blockStart = zonedLocalToUtc(dateKey, block.startTime, timeZone).getTime();
    const blockEnd = zonedLocalToUtc(dateKey, block.endTime, timeZone).getTime();
    return rangesOverlap(startMs, endMs, blockStart, blockEnd);
  });
}

function overlapsBookedSession(
  startMs: number,
  endMs: number,
  bookedSessions: BookedSession[],
  bufferMinutes: number,
): boolean {
  const bufferMs = bufferMinutes * 60_000;

  return bookedSessions.some((session) => {
    const sessionStart = session.scheduledAt.getTime();
    const sessionEnd = sessionStart + session.durationMinutes * 60_000;
    const blockedStart = sessionStart - bufferMs;
    const blockedEnd = sessionEnd + bufferMs;
    return rangesOverlap(startMs, endMs, blockedStart, blockedEnd);
  });
}

function buildSlotId(startUtc: Date): string {
  return `slot-${startUtc.getTime()}`;
}

export function generateAvailableSlots(input: {
  config: AvailabilityConfig;
  serviceId: ServiceId;
  displayTimezone: string;
  bookedSessions: BookedSession[];
  now?: Date;
}): AvailabilityDay[] {
  const { config, serviceId, displayTimezone, bookedSessions } = input;
  const now = input.now ?? new Date();
  const durationMinutes = getServiceDurationMinutes(serviceId);
  const {
    businessTimezone,
    minNoticeHours,
    bufferMinutes,
    horizonDays,
    slotStepMinutes,
  } = config.settings;

  const minStartMs = now.getTime() + minNoticeHours * 60 * 60_000;
  const weeklyByDay = new Map(config.weekly.map((day) => [day.dayOfWeek, day]));

  let businessDateKey = getDateKeyInTimeZone(now, businessTimezone);
  const daysByDisplayDate = new Map<string, TimeSlot[]>();

  for (let dayOffset = 0; dayOffset < horizonDays; dayOffset += 1) {
    const isoDay = getIsoDayOfWeek(businessDateKey, businessTimezone);
    const schedule = weeklyByDay.get(isoDay);

    if (schedule?.enabled) {
      const windowStart = parseTimeToMinutes(schedule.startTime);
      const windowEnd = parseTimeToMinutes(schedule.endTime);

      for (
        let startMinutes = windowStart;
        startMinutes + durationMinutes <= windowEnd;
        startMinutes += slotStepMinutes
      ) {
        if (!isWithinWorkingWindow(startMinutes, startMinutes + durationMinutes, windowStart, windowEnd)) {
          continue;
        }

        const startUtc = zonedLocalToUtc(
          businessDateKey,
          minutesToTimeKey(startMinutes),
          businessTimezone,
        );
        const endUtc = new Date(startUtc.getTime() + durationMinutes * 60_000);
        const startMs = startUtc.getTime();
        const endMs = endUtc.getTime();

        if (startMs < minStartMs) continue;

        if (
          overlapsDailyBlock(startMs, endMs, businessDateKey, businessTimezone, config.blocks)
        ) {
          continue;
        }

        if (overlapsBookedSession(startMs, endMs, bookedSessions, bufferMinutes)) {
          continue;
        }

        const slot: TimeSlot = {
          id: buildSlotId(startUtc),
          startTime: startUtc.toISOString(),
          endTime: endUtc.toISOString(),
          available: true,
        };

        const displayDateKey = getDateKeyInTimeZone(startUtc, displayTimezone);
        const existing = daysByDisplayDate.get(displayDateKey) ?? [];
        existing.push(slot);
        daysByDisplayDate.set(displayDateKey, existing);
      }
    }

    businessDateKey = addDaysToDateKey(businessDateKey, 1, businessTimezone);
  }

  return Array.from(daysByDisplayDate.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, slots]) => ({
      date,
      slots: slots.sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      ),
    }));
}

export function findSlotInAvailability(
  availability: AvailabilityDay[],
  slotId: string,
): TimeSlot | undefined {
  for (const day of availability) {
    const slot = day.slots.find((entry) => entry.id === slotId);
    if (slot) return slot;
  }
  return undefined;
}

export function slotMatchesScheduledAt(slot: TimeSlot, scheduledAt: string): boolean {
  return slot.startTime === new Date(scheduledAt).toISOString();
}
