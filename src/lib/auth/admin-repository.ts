import { createHash } from "node:crypto";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { hashPassword, verifyPassword } from "./password";
import type { AuthenticatedUser } from "./types";

export type AdminUserRecord = {
  id: string;
  email: string;
  displayName: string | null;
  passwordHash: string;
  isActive: boolean;
  mfaEnabled: boolean;
};

function mapAdminUser(admin: {
  id: string;
  email: string;
  displayName: string | null;
  passwordHash: string;
  isActive: boolean;
  mfaEnabled: boolean;
}): AdminUserRecord {
  return {
    id: admin.id,
    email: admin.email,
    displayName: admin.displayName,
    passwordHash: admin.passwordHash,
    isActive: admin.isActive,
    mfaEnabled: admin.mfaEnabled,
  };
}

function isDevMockAuthEnabled(): boolean {
  return process.env.NODE_ENV === "development" && !isDatabaseConfigured();
}

let mockAdminHashPromise: Promise<string> | null = null;

async function getDevMockAdmin(): Promise<AdminUserRecord> {
  const password = process.env.ADMIN_PASSWORD ?? "change-me-in-production";
  if (!mockAdminHashPromise) {
    mockAdminHashPromise = hashPassword(password);
  }

  return {
    id: "adm_dev_mock",
    email: (process.env.ADMIN_EMAIL ?? "admin@niksravins.com").toLowerCase(),
    displayName: "Development Admin",
    passwordHash: await mockAdminHashPromise,
    isActive: true,
    mfaEnabled: false,
  };
}

export async function findAdminByEmail(email: string): Promise<AdminUserRecord | null> {
  const normalized = email.trim().toLowerCase();

  if (isDatabaseConfigured()) {
    try {
      const admin = await prisma.adminUser.findUnique({
        where: { email: normalized },
      });
      if (admin) return mapAdminUser(admin);
    } catch {
      // Fall through when database is unavailable.
    }
  }

  if (isDevMockAuthEnabled()) {
    const mockAdmin = await getDevMockAdmin();
    if (mockAdmin.email === normalized) return mockAdmin;
  }

  return null;
}

export async function verifyAdminCredentials(
  email: string,
  password: string,
): Promise<AuthenticatedUser | null> {
  const admin = await findAdminByEmail(email);
  if (!admin || !admin.isActive) return null;

  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid) return null;

  return {
    id: admin.id,
    email: admin.email,
    role: "ADMIN",
    clientId: null,
    practitionerId: null,
    mfaEnabled: admin.mfaEnabled,
    displayName: admin.displayName,
  };
}

export async function createAdminSession(input: {
  adminId: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<string> {
  const sessionId = createHash("sha256")
    .update(`${input.adminId}:${input.token}:${Date.now()}`)
    .digest("hex")
    .slice(0, 32);

  if (isDatabaseConfigured()) {
    try {
      await prisma.adminSession.create({
        data: {
          id: sessionId,
          adminId: input.adminId,
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

export async function revokeAdminSession(sessionId: string): Promise<void> {
  if (!isDatabaseConfigured()) return;

  try {
    await prisma.adminSession.delete({ where: { id: sessionId } });
  } catch {
    // Ignore missing sessions.
  }
}

export async function revokeAllAdminSessions(adminId: string): Promise<void> {
  if (!isDatabaseConfigured()) return;

  try {
    await prisma.adminSession.deleteMany({ where: { adminId } });
  } catch {
    // Ignore when database is unavailable.
  }
}

export async function isAdminSessionActive(sessionId: string): Promise<boolean> {
  if (!isDatabaseConfigured()) return true;

  try {
    const session = await prisma.adminSession.findUnique({
      where: { id: sessionId },
      select: { expiresAt: true },
    });

    if (!session) return false;
    return session.expiresAt.getTime() > Date.now();
  } catch {
    return false;
  }
}

export async function touchAdminLastLogin(adminId: string): Promise<void> {
  if (!isDatabaseConfigured()) return;

  try {
    await prisma.adminUser.update({
      where: { id: adminId },
      data: { lastLoginAt: new Date() },
    });
  } catch {
    // Ignore when database is unavailable.
  }
}

export async function createAdminUser(input: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<AdminUserRecord> {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is required to create admin users.");
  }

  const email = input.email.trim().toLowerCase();
  const passwordHash = await hashPassword(input.password);

  const admin = await prisma.adminUser.create({
    data: {
      email,
      passwordHash,
      displayName: input.displayName ?? null,
    },
  });

  return mapAdminUser(admin);
}

export async function listAdminUsers() {
  if (!isDatabaseConfigured()) return [];

  try {
    return await prisma.adminUser.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        email: true,
        displayName: true,
        isActive: true,
        mfaEnabled: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
  } catch {
    return [];
  }
}

export { hashPassword };
