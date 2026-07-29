import type { BookingRequest } from "./types";
import { validateClientDetails } from "./client-details";
import { getServiceById } from "./services-catalog";

export function validateBookingRequest(
  request: BookingRequest,
): string | null {
  if (!request.serviceId || !getServiceById(request.serviceId)) {
    return "Please select a valid session type.";
  }

  if (!request.slotId?.trim()) {
    return "Please select a time slot.";
  }

  if (!request.scheduledAt?.trim()) {
    return "Please select a scheduled time.";
  }

  const scheduledAt = new Date(request.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime())) {
    return "The selected time is invalid.";
  }

  if (scheduledAt.getTime() <= Date.now()) {
    return "Please select a future time slot.";
  }

  const clientErrors = validateClientDetails(request.client);
  const firstError = Object.values(clientErrors)[0];
  if (firstError) return firstError;

  return null;
}
