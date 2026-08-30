import type { BookingRequest } from "./types";
import { validateClientDetails } from "./client-details";
import { getActiveOfferById, isCourseOffer } from "./offer-repository";

export async function validateBookingRequest(
  request: BookingRequest,
): Promise<string | null> {
  const service = await getActiveOfferById(request.serviceId);
  if (!service) {
    return "Please select a valid session type.";
  }

  const isCourse = isCourseOffer(service);

  if (isCourse) {
    if (!request.courseStartDate?.trim()) {
      return "Please select a course start date.";
    }
    const startDate = new Date(request.courseStartDate);
    if (Number.isNaN(startDate.getTime())) {
      return "The selected start date is invalid.";
    }
    if (startDate.getTime() <= Date.now()) {
      return "Please select a future start date.";
    }
  } else {
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
  }

  const clientErrors = validateClientDetails(request.client);
  const firstError = Object.values(clientErrors)[0];
  if (firstError) return firstError;

  return null;
}
