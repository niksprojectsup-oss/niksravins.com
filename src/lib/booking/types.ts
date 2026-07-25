/** Booking domain types — shared across client UI, API routes, and future admin. */

export type ServiceId = "initial-aap-session" | "aap-transformation-package";

export type ServiceKind = "single-session" | "package";

export interface BookableService {
  id: ServiceId;
  title: string;
  description: string;
  kind: ServiceKind;
  durationLabel?: string;
  durationMinutes?: number;
}

export type BookingStep =
  | "session"
  | "schedule"
  | "details"
  | "payment"
  | "confirmed";

export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentProvider = "stripe" | "paypal";

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface AvailabilityDay {
  date: string;
  slots: TimeSlot[];
}

export interface ClientProfile {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  timezone: string;
}

export interface ClientDetails extends ClientProfile {
  sessionIntention: string;
}

export interface BookingDraft {
  serviceId: ServiceId | null;
  slotId: string | null;
  scheduledAt: string | null;
  client: ClientDetails | null;
}

export interface BookingRequest {
  serviceId: ServiceId;
  slotId: string;
  scheduledAt: string;
  client: ClientDetails;
}

export interface BookingRecord extends BookingRequest {
  id: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentProvider?: PaymentProvider;
  createdAt: string;
  updatedAt: string;
}

/** Future: replace mock with real availability provider. */
export interface AvailabilityService {
  getAvailability(
    from: Date,
    to: Date,
    serviceId: ServiceId,
  ): Promise<AvailabilityDay[]>;
}

/** Future: persist bookings and send confirmations. */
export interface BookingService {
  createBooking(request: BookingRequest): Promise<BookingRecord>;
  getBooking(id: string): Promise<BookingRecord | null>;
  listBookingsByClient(clientId: string): Promise<BookingRecord[]>;
}

/** Future: Stripe + PayPal integration. */
export interface PaymentService {
  createStripeCheckout(bookingId: string): Promise<{ checkoutUrl: string }>;
  createPayPalOrder(bookingId: string): Promise<{ orderId: string }>;
}

/** Future: admin dashboard + client profiles. */
export interface AdminService {
  listClients(): Promise<ClientProfile[]>;
  getClientHistory(clientId: string): Promise<BookingRecord[]>;
  updateAvailability(slots: TimeSlot[]): Promise<void>;
  listServices(): Promise<BookableService[]>;
}

export const BOOKING_STEPS: BookingStep[] = [
  "session",
  "schedule",
  "details",
  "payment",
  "confirmed",
];

/** @deprecated Use BookableService catalog — kept for migration compatibility. */
export type SessionType = ServiceId;
