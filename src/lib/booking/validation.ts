import type { BookingUiContent } from "@/content/i18n/types";
import type { BookingRequest } from "./types";
import { validateClientDetails } from "./client-details";
import { getActiveOfferById, isCourseOffer } from "./offer-repository";

export type BookingValidationMessages = BookingUiContent["validation"];

export async function validateBookingRequest(
  request: BookingRequest,
  messages?: BookingValidationMessages,
): Promise<string | null> {
  const service = await getActiveOfferById(request.serviceId);
  if (!service) {
    return messages?.invalidSessionType ?? "Please select a valid session type.";
  }

  const isCourse = isCourseOffer(service);

  if (isCourse) {
    if (!request.courseStartDate?.trim()) {
      return messages?.selectCourseStartDate ?? "Please select a course start date.";
    }
    const startDate = new Date(request.courseStartDate);
    if (Number.isNaN(startDate.getTime())) {
      return messages?.invalidStartDate ?? "The selected start date is invalid.";
    }
    if (startDate.getTime() <= Date.now()) {
      return messages?.futureStartDate ?? "Please select a future start date.";
    }
  } else {
    if (!request.slotId?.trim()) {
      return messages?.selectTimeSlot ?? "Please select a time slot.";
    }

    if (!request.scheduledAt?.trim()) {
      return messages?.selectScheduledTime ?? "Please select a scheduled time.";
    }

    const scheduledAt = new Date(request.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) {
      return messages?.invalidTime ?? "The selected time is invalid.";
    }

    if (scheduledAt.getTime() <= Date.now()) {
      return messages?.futureTimeSlot ?? "Please select a future time slot.";
    }
  }

  const clientErrors = validateClientDetails(request.client, messages);
  const firstError = Object.values(clientErrors)[0];
  if (firstError) return firstError;

  return null;
}
