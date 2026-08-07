import { createHash, randomBytes } from "node:crypto";
import { isDatabaseConfigured, prisma, requireDatabase } from "@/lib/db/prisma";
import { hashPassword, verifyPassword } from "./password";
import type { AuthenticatedUser } from "./types";

const PASSWORD_SETUP_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type ClientUserRecord = {
  id: string;
  email: string;
  clientId: string | null;
  passwordHash: string;
  passwordSetAt: Date | null;
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function mapClientUser(user: {
  id: string;
  email: string;
  clientId: string | null;
  passwordHash: string;
  passwordSetAt: Date | null;
}): ClientUserRecord {
  return {
    id: user.id,
    email: user.email,
    clientId: user.clientId,
    passwordHash: user.passwordHash,
    passwordSetAt: user.passwordSetAt,
  };
}

export async function findClientUserByEmail(
  email: string,
): Promise<ClientUserRecord | null> {
  if (!isDatabaseConfigured()) return null;

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user || user.role !== "CLIENT") return null;
  return mapClientUser(user);
}

export async function verifyClientCredentials(
  email: string,
  password: string,
): Promise<AuthenticatedUser | null> {
  const user = await findClientUserByEmail(email);
  if (!user || !user.passwordSetAt) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;

  return {
    id: user.id,
    email: user.email,
    role: "CLIENT",
    clientId: user.clientId,
    practitionerId: null,
    mfaEnabled: false,
  };
}

export async function createClientAuthSession(input: {
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

  if (!isDatabaseConfigured()) return sessionId;

  try {
    await prisma.authSession.create({
      data: {
        id: sessionId,
        userId: input.userId,
        tokenHash: hashToken(input.token),
        expiresAt: input.expiresAt,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    });
  } catch {
    // Session persistence is optional when database is unavailable.
  }

  return sessionId;
}

export async function revokeClientAuthSession(sessionId: string): Promise<void> {
  if (!isDatabaseConfigured()) return;

  try {
    await prisma.authSession.delete({ where: { id: sessionId } });
  } catch {
    // Ignore missing sessions.
  }
}

export async function isClientAuthSessionActive(sessionId: string): Promise<boolean> {
  if (!isDatabaseConfigured()) return true;

  try {
    const session = await prisma.authSession.findUnique({
      where: { id: sessionId },
      select: { expiresAt: true },
    });

    if (!session) return false;
    return session.expiresAt.getTime() > Date.now();
  } catch {
    return false;
  }
}

export type EnsurePortalAccountResult = {
  userId: string;
  isNewAccount: boolean;
  setupToken?: string;
};

export async function ensureClientPortalAccount(input: {
  clientId: string;
  email: string;
}): Promise<EnsurePortalAccountResult | null> {
  requireDatabase();

  const normalizedEmail = input.email.trim().toLowerCase();

  const existingByClient = await prisma.user.findFirst({
    where: { role: "CLIENT", clientId: input.clientId },
  });

  if (existingByClient) {
    if (existingByClient.email !== normalizedEmail) {
      await prisma.user.update({
        where: { id: existingByClient.id },
        data: { email: normalizedEmail },
      });
    }

    return {
      userId: existingByClient.id,
      isNewAccount: false,
    };
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingByEmail) {
    if (existingByEmail.role !== "CLIENT") {
      console.error("[portal] Email already used by non-client account", {
        clientId: input.clientId,
      });
      return null;
    }

    await prisma.user.update({
      where: { id: existingByEmail.id },
      data: { clientId: input.clientId },
    });

    return {
      userId: existingByEmail.id,
      isNewAccount: false,
    };
  }

  const placeholderPassword = await hashPassword(randomBytes(32).toString("hex"));
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash: placeholderPassword,
      role: "CLIENT",
      clientId: input.clientId,
      passwordSetAt: null,
    },
  });

  const setupToken = randomBytes(32).toString("hex");
  await prisma.clientPasswordToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(setupToken),
      expiresAt: new Date(Date.now() + PASSWORD_SETUP_TTL_MS),
    },
  });

  return {
    userId: user.id,
    isNewAccount: true,
    setupToken,
  };
}

export async function consumePasswordSetupToken(input: {
  token: string;
  password: string;
}): Promise<{ userId: string; email: string } | null> {
  requireDatabase();

  const tokenHash = hashToken(input.token.trim());
  const record = await prisma.clientPasswordToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record || record.usedAt || record.expiresAt.getTime() <= Date.now()) {
    return null;
  }

  if (record.user.role !== "CLIENT") return null;

  const passwordHash = await hashPassword(input.password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: {
        passwordHash,
        passwordSetAt: new Date(),
        emailVerified: new Date(),
      },
    }),
    prisma.clientPasswordToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return {
    userId: record.user.id,
    email: record.user.email,
  };
}
