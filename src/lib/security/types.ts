export const ROLES = ["ADMIN", "CLIENT"] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  "admin:full",
  "client:read_own",
  "client:write_own",
  "sessions:read_own",
  "sessions:write_own",
  "payments:read_own",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export type AuditAction =
  | "auth.login"
  | "auth.login_failed"
  | "auth.logout"
  | "auth.mfa_required"
  | "auth.mfa_verified"
  | "client.read"
  | "client.update"
  | "session.create"
  | "session.update"
  | "reaction_analysis.update"
  | "practitioner_notes.update"
  | "payment.read"
  | "payment.create"
  | "user.create"
  | "data.export"
  | "data.delete"
  | "availability.update"
  | "offer.create"
  | "offer.update";

export type AuditResource =
  | "auth"
  | "client"
  | "session"
  | "reaction_analysis"
  | "practitioner_notes"
  | "payment"
  | "user"
  | "booking_settings"
  | "bookable_offer"
  | "session_package";

export type RateLimitScope =
  | "auth.login"
  | "auth.mfa"
  | "api.general"
  | "portal.general";
