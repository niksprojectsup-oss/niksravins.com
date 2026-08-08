"use server";

import { getAvailableSlots } from "@/lib/booking/availability/availability-service";
import type { AvailabilityDay, ServiceId } from "@/lib/booking/types";

function logAvailabilityDateRange(days: AvailabilityDay[]) {
  if (days.length === 0) return null;
  return { from: days[0]!.date, to: days[days.length - 1]!.date };
}

export async function getAvailabilityAction(
  serviceId: ServiceId,
  displayTimezone: string,
): Promise<AvailabilityDay[]> {
  if (process.env.NODE_ENV === "development") {
    console.log("[availability] request", { serviceId, displayTimezone });
  }

  try {
    const days = await getAvailableSlots(serviceId, displayTimezone);

    if (process.env.NODE_ENV === "development") {
      console.log("[availability] success", {
        serviceId,
        displayTimezone,
        dayCount: days.length,
        dateRange: logAvailabilityDateRange(days),
      });
    }

    return days;
  } catch (error) {
    console.error("[availability] failed", {
      serviceId,
      displayTimezone,
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}
