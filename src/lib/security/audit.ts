import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import type { AuditAction, AuditResource, Role } from "@/lib/security/types";
import type { Prisma } from "@prisma/client";

export type AuditLogInput = {
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string | null;
  actorId?: string | null;
  actorRole?: Role | null;
  metadata?: Prisma.InputJsonValue | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function logAuditEvent(input: AuditLogInput): Promise<void> {
  if (!isDatabaseConfigured()) {
    if (process.env.NODE_ENV === "development") {
      console.info("[audit]", input.action, input.resource, input.resourceId ?? "");
    }
    return;
  }

  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId ?? null,
        actorId: input.actorId ?? null,
        actorRole: input.actorRole ?? null,
        metadata: input.metadata ?? undefined,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log.", error);
  }
}

export async function listRecentAuditEvents(limit = 50) {
  if (!isDatabaseConfigured()) return [];

  try {
    return await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch {
    return [];
  }
}
