/**
 * Admin service layer — replace mock implementations with database/API calls.
 */

import type {
  AdminDataService,
  AuthService,
  ClientPortalService,
  StripeAdminService,
} from "./types";

/** Future: NextAuth, Clerk, or custom credentials auth. */
export const authService: AuthService = {
  async getSession() {
    return null;
  },
  async signIn() {
    throw new Error("Authentication not implemented");
  },
  async signOut() {
    throw new Error("Authentication not implemented");
  },
};

/** Future: Prisma/Drizzle/Supabase implementation. */
export const adminDataService: AdminDataService = {
  async getDashboardStats() {
    throw new Error("Database not connected");
  },
  async listClients() {
    throw new Error("Database not connected");
  },
  async listSessions() {
    throw new Error("Database not connected");
  },
  async listPayments() {
    throw new Error("Database not connected");
  },
  async getCalendarSlots() {
    throw new Error("Database not connected");
  },
};

/** Future: Stripe SDK + webhooks. */
export const stripeAdminService: StripeAdminService = {
  async listCharges() {
    throw new Error("Stripe not connected");
  },
  async syncPayment() {
    throw new Error("Stripe not connected");
  },
};

/** Future: client portal invitations and session access. */
export const clientPortalService: ClientPortalService = {
  async inviteClient() {
    throw new Error("Client portal not implemented");
  },
  async listPortalSessions() {
    throw new Error("Client portal not implemented");
  },
};
