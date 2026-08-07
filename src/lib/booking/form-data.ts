import type { BookingRequest, ServiceId } from "./types";

export function parseBookingFormData(formData: FormData): BookingRequest {
  return {
    serviceId: String(formData.get("serviceId") ?? "") as ServiceId,
    slotId: String(formData.get("slotId") ?? ""),
    scheduledAt: String(formData.get("scheduledAt") ?? ""),
    client: {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      country: String(formData.get("country") ?? ""),
      timezone: String(formData.get("timezone") ?? ""),
      sessionIntention: String(formData.get("sessionIntention") ?? ""),
    },
  };
}
