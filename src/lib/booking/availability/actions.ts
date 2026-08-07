"use server";

import { getAvailableSlots } from "@/lib/booking/availability/availability-service";
import {
  logAvailabilityError,
  resolveDisplayTimezone,
  resolveServiceId,
} from "@/lib/booking/availability/utils";
import type { AvailabilityDay } from "@/lib/booking/types";

export async function getAvailabilityAction(
  serviceId: string,
  displayTimezone: string,
): Promise<AvailabilityDay[]> {
  const resolvedServiceId = resolveServiceId(serviceId);
  const resolvedTimezone = resolveDisplayTimezone(displayTimezone);

  if (!resolvedServiceId) {
    logAvailabilityError("invalid service id", new Error("Unknown service id"), {
      serviceId,
      displayTimezone: resolvedTimezone,
    });
    throw new Error("The selected service is not available for booking.");
  }

  try {
    return await getAvailableSlots(resolvedServiceId, resolvedTimezone);
  } catch (error) {
    logAvailabilityError("getAvailabilityAction failed", error, {
      serviceId: resolvedServiceId,
      displayTimezone: resolvedTimezone,
    });
    throw error;
  }
}
