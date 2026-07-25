import type { Permission, Role } from "./types";

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  ADMIN: ["admin:full"],
  CLIENT: [
    "client:read_own",
    "client:write_own",
    "sessions:read_own",
    "sessions:write_own",
    "payments:read_own",
  ],
};

export function permissionsForRole(role: Role): readonly Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (permissions.includes("admin:full")) return true;
  return permissions.includes(permission);
}

export function canAccessClientData(
  role: Role,
  sessionClientId: string | null | undefined,
  targetClientId: string,
): boolean {
  if (role === "ADMIN") return true;
  if (role === "CLIENT") return sessionClientId === targetClientId;
  return false;
}
