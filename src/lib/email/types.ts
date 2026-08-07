import type { ServiceId } from "@/lib/booking/types";

export type BookingEmailPayload = {
  bookingId: string;
  serviceId: ServiceId;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientTimezone: string;
  serviceTitle: string;
  durationLabel: string;
  scheduledAt: string;
  isPackage: boolean;
  checkoutNote?: string;
};

export type EmailMessage = {
  subject: string;
  html: string;
  text: string;
};
