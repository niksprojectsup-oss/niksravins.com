import { prisma, requireDatabase } from "@/lib/db/prisma";
import { getServiceDurationMinutes } from "@/lib/booking/services-catalog";
import type { AvailabilityDay, ServiceId } from "@/lib/booking/types";
import {
  findSlotInAvailability,
  generateAvailableSlots,
  slotMatchesScheduledAt,
} from "./slot-generator";
import { getAvailabilityConfig } from "./config-repository";

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

  return sessions.map((session) => ({
    scheduledAt: session.scheduledAt,
    durationMinutes: getServiceDurationMinutes(
      (session.serviceId ?? "initial-aap-session") as ServiceId,
    ),
  }));
}

export async function getAvailableSlots(
  serviceId: ServiceId,
  displayTimezone: string,
): Promise<AvailabilityDay[]> {
  requireDatabase();

  const config = await getAvailabilityConfig();
  const now = new Date();
  const horizonEnd = new Date(now);
  horizonEnd.setUTCDate(horizonEnd.getUTCDate() + config.settings.horizonDays + 7);

  if (process.env.NODE_ENV === "development") {
    console.log("[availability] loading booked sessions", {
      serviceId,
      displayTimezone,
      from: now.toISOString(),
      to: horizonEnd.toISOString(),
    });
  }

  const bookedSessions = await loadBookedSessions(now, horizonEnd);

  return generateAvailableSlots({
    config,
    serviceId,
    displayTimezone,
    bookedSessions,
    now,
  });
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
    input.displayTimezone ?? "UTC",
  );

  const slot = findSlotInAvailability(availability, input.slotId);
  if (!slot || !slot.available) {
    throw new AvailabilityError("The selected time is no longer available.");
  }

  if (!slotMatchesScheduledAt(slot, input.scheduledAt)) {
    throw new AvailabilityError("The selected time does not match the chosen slot.");
  }
}
