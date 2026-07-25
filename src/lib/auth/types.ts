import type { Role } from "@/lib/security/types";

export type AuthSessionPayload = {
  sub: string;
  email: string;
  role: Role;
  clientId?: string | null;
  practitionerId?: string | null;
  sessionId: string;
  mfaVerified: boolean;
};

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: Role;
  clientId: string | null;
  practitionerId: string | null;
  mfaEnabled: boolean;
};

export type SessionContext = AuthenticatedUser & {
  sessionId: string;
  mfaVerified: boolean;
};

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const MFA_PENDING_MAX_AGE_SECONDS = 60 * 10;
