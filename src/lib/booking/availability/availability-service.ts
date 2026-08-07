import { prisma, requireDatabase } from "@/lib/db/prisma";
import { getServiceDurationMinutes, getServiceById } from "@/lib/booking/services-catalog";
import type { AvailabilityDay, ServiceId } from "@/lib/booking/types";
import {
  findSlotInAvailability,
  generateAvailableSlots,
  slotMatchesScheduledAt,
} from "./slot-generator";
import { getAvailabilityConfig } from "./config-repository";
import {
  logAvailabilityError,
  resolveDisplayTimezone,
  resolveServiceId,
} from "./utils";

export class AvailabilityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AvailabilityError";
  }
}

async function loadBookedSessions(from: Date, to: Date) {
  const sessions = await prisma.session.findMany({
    where: {
      status: { in: ["SCHEDULED", "COMPLETED"] },
      scheduledAt: { gte: from, lte: to },
    },
    select: {
      scheduledAt: true,
      serviceId: true,
    },
  });

  return sessions.map((session) => {
    const serviceId = resolveServiceId(session.serviceId ?? "") ?? "initial-aap-session";
    return {
      scheduledAt: session.scheduledAt,
      durationMinutes: getServiceDurationMinutes(serviceId),
    };
  });
}

export async function getAvailableSlots(
  serviceId: ServiceId,
  displayTimezone: string,
): Promise<AvailabilityDay[]> {
  requireDatabase();

  const resolvedServiceId = resolveServiceId(serviceId);
  if (!resolvedServiceId || !getServiceById(resolvedServiceId)) {
    throw new AvailabilityError("The selected service is not available for booking.");
  }

  const resolvedTimezone = resolveDisplayTimezone(displayTimezone);

  try {
    const config = await getAvailabilityConfig();
    const now = new Date();
    const horizonEnd = new Date(now);
    horizonEnd.setUTCDate(horizonEnd.getUTCDate() + config.settings.horizonDays + 7);

    const bookedSessions = await loadBookedSessions(now, horizonEnd);

    return generateAvailableSlots({
      config,
      serviceId: resolvedServiceId,
      displayTimezone: resolvedTimezone,
      bookedSessions,
      now,
    });
  } catch (error) {
    logAvailabilityError("getAvailableSlots failed", error, {
      serviceId: resolvedServiceId,
      displayTimezone: resolvedTimezone,
    });
    throw error;
  }
}

export async function validateBookableSlot(input: {
  serviceId: ServiceId;
  slotId: string;
  scheduledAt: string;
  displayTimezone?: string;
}): Promise<void> {
  requireDatabase();

  const scheduledDate = new Date(input.scheduledAt);
  if (Number.isNaN(scheduledDate.getTime())) {
    throw new AvailabilityError("The selected time is invalid.");
  }

  const availability = await getAvailableSlots(
    input.serviceId,
    resolveDisplayTimezone(input.displayTimezone),
  );

  const slot = findSlotInAvailability(availability, input.slotId);
  if (!slot || !slot.available) {
    throw new AvailabilityError("The selected time is no longer available.");
  }

  if (!slotMatchesScheduledAt(slot, input.scheduledAt)) {
    throw new AvailabilityError("The selected time does not match the chosen slot.");
  }
}
