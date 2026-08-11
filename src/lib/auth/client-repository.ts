import { createHash, randomBytes } from "node:crypto";
import { isDatabaseConfigured, prisma, requireDatabase } from "@/lib/db/prisma";
import { sendCreatePasswordEmail } from "@/lib/email/send-portal-setup-email";
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
  setupToken?: string;
  passwordAlreadySet: boolean;
};

async function createPasswordSetupToken(userId: string): Promise<string> {
  const setupToken = randomBytes(32).toString("hex");
  await prisma.clientPasswordToken.create({
    data: {
      userId,
      tokenHash: hashToken(setupToken),
      expiresAt: new Date(Date.now() + PASSWORD_SETUP_TTL_MS),
    },
  });
  return setupToken;
}

export async function ensureClientPortalAccount(input: {
  clientId: string;
  email: string;
}): Promise<EnsurePortalAccountResult | null> {
  requireDatabase();

  const normalizedEmail = input.email.trim().toLowerCase();

  console.info("[portal] provisioning attempted", {
    clientId: input.clientId,
  });

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

    if (existingByClient.passwordSetAt) {
      console.info("[portal] linked existing account with password", {
        clientId: input.clientId,
        userId: existingByClient.id,
      });
      return {
        userId: existingByClient.id,
        passwordAlreadySet: true,
      };
    }

    const setupToken = await createPasswordSetupToken(existingByClient.id);
    console.info("[portal] password token created for existing account", {
      clientId: input.clientId,
      userId: existingByClient.id,
    });
    return {
      userId: existingByClient.id,
      setupToken,
      passwordAlreadySet: false,
    };
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingByEmail) {
    if (existingByEmail.role !== "CLIENT") {
      console.error("[portal] email already used by non-client account", {
        clientId: input.clientId,
      });
      return null;
    }

    await prisma.user.update({
      where: { id: existingByEmail.id },
      data: { clientId: input.clientId },
    });

    if (existingByEmail.passwordSetAt) {
      console.info("[portal] linked existing account by email", {
        clientId: input.clientId,
        userId: existingByEmail.id,
      });
      return {
        userId: existingByEmail.id,
        passwordAlreadySet: true,
      };
    }

    const setupToken = await createPasswordSetupToken(existingByEmail.id);
    console.info("[portal] password token created for linked account", {
      clientId: input.clientId,
      userId: existingByEmail.id,
    });
    return {
      userId: existingByEmail.id,
      setupToken,
      passwordAlreadySet: false,
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

  const setupToken = await createPasswordSetupToken(user.id);
  console.info("[portal] account created", {
    clientId: input.clientId,
    userId: user.id,
  });
  console.info("[portal] password token created", {
    clientId: input.clientId,
    userId: user.id,
  });

  return {
    userId: user.id,
    setupToken,
    passwordAlreadySet: false,
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

export type PortalSetupEmailResult = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  providerId?: string;
};

function mapEmailResult(result: import("@/lib/email/client").SendEmailResult): PortalSetupEmailResult {
  if (result.ok) {
    return { ok: true, providerId: result.id };
  }
  return {
    ok: false,
    skipped: result.skipped,
    reason: result.reason,
  };
}

/** Issue a fresh setup token and send the portal password email (admin/resend). */
export async function sendPortalSetupEmailForClient(
  clientId: string,
): Promise<PortalSetupEmailResult> {
  requireDatabase();

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { firstName: true, email: true },
  });

  if (!client) {
    return { ok: false, reason: "client_not_found" };
  }

  const normalizedEmail = client.email.trim().toLowerCase();
  let user = await prisma.user.findFirst({
    where: { role: "CLIENT", clientId },
  });

  if (!user) {
    const provisioned = await ensureClientPortalAccount({
      clientId,
      email: normalizedEmail,
    });

    if (!provisioned?.setupToken) {
      return {
        ok: false,
        skipped: true,
        reason: provisioned?.passwordAlreadySet
          ? "password_already_set"
          : "provisioning_failed",
      };
    }

    return mapEmailResult(
      await sendCreatePasswordEmail({
        firstName: client.firstName,
        email: normalizedEmail,
        setupToken: provisioned.setupToken,
        clientId,
      }),
    );
  }

  if (user.passwordSetAt) {
    return { ok: false, skipped: true, reason: "password_already_set" };
  }

  const setupToken = await createPasswordSetupToken(user.id);
  console.info("[portal] resend setup token created", {
    clientId,
    userId: user.id,
  });

  return mapEmailResult(
    await sendCreatePasswordEmail({
      firstName: client.firstName,
      email: normalizedEmail,
      setupToken,
      clientId,
    }),
  );
}
