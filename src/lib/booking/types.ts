/** Booking domain types — shared across client UI, API routes, and admin. */

export type ServiceId = string;

export type ServiceKind = "single-session" | "package" | "course";

export type OfferTypeName = "SINGLE_SESSION" | "PACKAGE" | "COURSE";

export interface BookableService {
  id: ServiceId;
  slug: string;
  title: string;
  description: string;
  detail?: string;
  highlights?: string[];
  bonuses?: string[];
  checkoutNote?: string;
  kind: ServiceKind;
  offerType: OfferTypeName;
  durationLabel?: string;
  durationMinutes?: number;
  priceLabel?: string;
  priceCents: number;
  currency: string;
  packageSessions?: number;
  requiresStartDate: boolean;
}

export type BookingStep =
  | "session"
  | "schedule"
  | "start-date"
  | "details"
  | "payment"
  | "confirmed";

export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentProvider = "stripe";

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
  phone?: string;
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
  courseStartDate: string | null;
  client: ClientDetails | null;
}

export interface BookingRequest {
  serviceId: ServiceId;
  slotId: string;
  scheduledAt: string;
  courseStartDate?: string | null;
  client: ClientDetails;
}

export interface BookingRecord extends BookingRequest {
  id: string;
  clientId: string;
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

/** Stripe checkout integration. */
export interface PaymentService {
  createStripeCheckout(bookingId: string): Promise<{ checkoutUrl: string }>;
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
  "start-date",
  "details",
  "payment",
  "confirmed",
];

/** @deprecated Use BookableService catalog — kept for migration compatibility. */
export type SessionType = ServiceId;

/** Legacy stable IDs for existing records. */
export const LEGACY_SERVICE_IDS = {
  INITIAL_SESSION: "initial-aap-session",
  TRANSFORMATION_PACKAGE: "aap-transformation-package",
} as const;

export const DEFAULT_PACKAGE_SESSIONS = 5;
