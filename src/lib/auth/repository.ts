import { createHash } from "node:crypto";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { verifyPassword, hashPassword } from "./password";
import type { AuthenticatedUser } from "./types";
import type { Role } from "@/lib/security/types";

export type AuthUserRecord = AuthenticatedUser & {
  passwordHash: string;
};

const MOCK_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "change-me-in-production";
let mockAdminHashPromise: Promise<string> | null = null;

async function getMockAdminHash(): Promise<string> {
  if (!mockAdminHashPromise) {
    mockAdminHashPromise = hashPassword(MOCK_ADMIN_PASSWORD);
  }
  return mockAdminHashPromise;
}

async function getMockAdminUser(): Promise<AuthUserRecord> {
  return {
    id: "usr_admin_mock",
    email: process.env.ADMIN_EMAIL ?? "admin@niksravins.com",
    role: "ADMIN",
    clientId: null,
    practitionerId: null,
    mfaEnabled: false,
    passwordHash: await getMockAdminHash(),
  };
}

function mapDbUser(user: {
  id: string;
  email: string;
  role: Role;
  clientId: string | null;
  practitionerId: string | null;
  passwordHash: string;
  mfaEnabled: boolean;
}): AuthUserRecord {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    clientId: user.clientId,
    practitionerId: user.practitionerId,
    mfaEnabled: user.mfaEnabled,
    passwordHash: user.passwordHash,
  };
}

export async function findUserByEmail(email: string): Promise<AuthUserRecord | null> {
  const normalized = email.trim().toLowerCase();

  if (isDatabaseConfigured()) {
    try {
      const user = await prisma.user.findUnique({ where: { email: normalized } });
      if (user) return mapDbUser(user);
    } catch {
      // Fall through to mock user.
    }
  }

  const mockAdmin = await getMockAdminUser();
  if (mockAdmin.email.toLowerCase() === normalized) {
    return mockAdmin;
  }

  return null;
}

export async function verifyUserCredentials(
  email: string,
  password: string,
): Promise<AuthenticatedUser | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    clientId: user.clientId,
    practitionerId: user.practitionerId,
    mfaEnabled: user.mfaEnabled,
  };
}

export async function createAuthSessionRecord(input: {
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<string> {
  const sessionId = createHash("sha256")
    .update(`${input.userId}:${input.token}:${Date.now()}`)
    .digest("hex")
    .slice(0, 32);

  if (isDatabaseConfigured()) {
    try {
      await prisma.authSession.create({
        data: {
          id: sessionId,
          userId: input.userId,
          tokenHash: createHash("sha256").update(input.token).digest("hex"),
          expiresAt: input.expiresAt,
          ipAddress: input.ipAddress ?? null,
          userAgent: input.userAgent ?? null,
        },
      });
    } catch {
      // Session persistence is optional when database is unavailable.
    }
  }

  return sessionId;
}

export async function revokeAuthSession(sessionId: string): Promise<void> {
  if (!isDatabaseConfigured()) return;

  try {
    await prisma.authSession.delete({ where: { id: sessionId } });
  } catch {
    // Ignore missing sessions.
  }
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
  if (!isDatabaseConfigured()) return;

  try {
    await prisma.authSession.deleteMany({ where: { userId } });
  } catch {
    // Ignore when database is unavailable.
  }
}

export { hashPassword };
