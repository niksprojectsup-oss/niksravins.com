import type { BookingRequest } from "./types";

export function parseBookingFormData(formData: FormData): BookingRequest {
  const courseStartDate = String(formData.get("courseStartDate") ?? "").trim();

  return {
    serviceId: String(formData.get("serviceId") ?? ""),
    slotId: String(formData.get("slotId") ?? ""),
    scheduledAt: String(formData.get("scheduledAt") ?? ""),
    courseStartDate: courseStartDate || null,
    client: {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      country: String(formData.get("country") ?? ""),
      timezone: String(formData.get("timezone") ?? ""),
      sessionIntention: String(formData.get("sessionIntention") ?? ""),
    },
  };
}
