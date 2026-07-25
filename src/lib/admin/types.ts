import type { PaymentStatus, ServiceId } from "@/lib/booking/types";

export type AdminSessionStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "no-show";

export type AdminPaymentRecordStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

export interface AdminClient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  timezone: string;
  sessionsCount: number;
  lastSessionAt: string | null;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface AdminSession {
  id: string;
  clientId: string;
  clientName: string;
  scheduledAt: string;
  serviceId: ServiceId;
  serviceTitle: string;
  status: AdminSessionStatus;
  notes: string;
}

export interface AdminPayment {
  id: string;
  clientId: string;
  clientName: string;
  sessionId: string;
  sessionLabel: string;
  amountCents: number;
  currency: string;
  status: AdminPaymentRecordStatus;
  provider?: "stripe" | "paypal";
  createdAt: string;
}

export interface CalendarSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  kind: "available" | "booked";
  sessionId?: string;
  clientName?: string;
}

export interface DashboardStats {
  upcomingCount: number;
  todayCount: number;
  weekCount: number;
  revenueCents: number;
  currency: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin";
}

/** Future: protect /admin routes. */
export interface AuthService {
  getSession(): Promise<AdminUser | null>;
  signIn(email: string, password: string): Promise<AdminUser>;
  signOut(): Promise<void>;
}

/** Future: database layer for admin data. */
export interface AdminDataService {
  getDashboardStats(): Promise<DashboardStats>;
  listClients(): Promise<AdminClient[]>;
  listSessions(): Promise<AdminSession[]>;
  listPayments(): Promise<AdminPayment[]>;
  getCalendarSlots(month: string): Promise<CalendarSlot[]>;
}

/** Future: Stripe webhook + reconciliation. */
export interface StripeAdminService {
  listCharges(limit?: number): Promise<AdminPayment[]>;
  syncPayment(sessionId: string): Promise<AdminPayment>;
}

/** Future: client-facing portal. */
export interface ClientPortalService {
  inviteClient(clientId: string): Promise<{ inviteUrl: string }>;
  listPortalSessions(clientId: string): Promise<AdminSession[]>;
}
