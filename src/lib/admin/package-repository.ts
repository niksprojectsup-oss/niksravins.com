import { getServiceById } from "@/lib/booking/services-catalog";
import { validateBookableSlot } from "@/lib/booking/availability/availability-service";
import { prisma, requireDatabase } from "@/lib/db/prisma";
import type {
  ClientPackageRecord,
  PackageSessionSlot,
} from "@/lib/admin/client-types";

export class PackageOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PackageOperationError";
  }
}

function mapSlotStatus(
  status: string | undefined,
): PackageSessionSlot["status"] {
  if (!status) return "not_scheduled";
  switch (status) {
    case "SCHEDULED":
      return "scheduled";
    case "COMPLETED":
      return "completed";
    case "CANCELLED":
      return "cancelled";
    case "NO_SHOW":
      return "no-show";
    default:
      return "not_scheduled";
  }
}

function buildPackageTimeline(
  totalSessions: number,
  sessions: {
    id: string;
    sessionNumber: number | null;
    scheduledAt: Date;
    status: string;
  }[],
): PackageSessionSlot[] {
  const byNumber = new Map(
    sessions
      .filter((session) => session.sessionNumber != null)
      .map((session) => [session.sessionNumber as number, session]),
  );

  return Array.from({ length: totalSessions }, (_, index) => {
    const sessionNumber = index + 1;
    const session = byNumber.get(sessionNumber);

    return {
      sessionNumber,
      label: `Session ${sessionNumber}`,
      sessionId: session?.id,
      scheduledAt: session?.scheduledAt.toISOString(),
      status: mapSlotStatus(session?.status),
    };
  });
}

export function mapSessionPackageRecord(pkg: {
  id: string;
  serviceId: string;
  totalSessions: number;
  completedSessions: number;
  status: string;
  createdAt: Date;
  sessions: {
    id: string;
    sessionNumber: number | null;
    scheduledAt: Date;
    status: string;
  }[];
}): ClientPackageRecord {
  const serviceTitle =
    getServiceById(
      pkg.serviceId as "initial-aap-session" | "aap-transformation-package",
    )?.title ?? pkg.serviceId;

  const remainingSessions = pkg.totalSessions - pkg.completedSessions;

  return {
    id: pkg.id,
    serviceId: pkg.serviceId,
    serviceTitle,
    totalSessions: pkg.totalSessions,
    completedSessions: pkg.completedSessions,
    remainingSessions,
    status: pkg.status.toLowerCase(),
    createdAt: pkg.createdAt.toISOString(),
    timeline: buildPackageTimeline(pkg.totalSessions, pkg.sessions),
  };
}

async function syncPackageProgress(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  packageId: string,
) {
  const pkg = await tx.sessionPackage.findUnique({
    where: { id: packageId },
  });
  if (!pkg) return;

  const completedSessions = await tx.session.count({
    where: { packageId, status: "COMPLETED" },
  });

  await tx.sessionPackage.update({
    where: { id: packageId },
    data: {
      completedSessions,
      status: completedSessions >= pkg.totalSessions ? "COMPLETED" : "ACTIVE",
    },
  });
}

export async function schedulePackageSession(
  packageId: string,
  scheduledAt: string,
): Promise<void> {
  requireDatabase();

  const when = new Date(scheduledAt);
  if (Number.isNaN(when.getTime())) {
    throw new PackageOperationError("Please provide a valid date and time.");
  }

  const pkgPreview = await prisma.sessionPackage.findUnique({
    where: { id: packageId },
  });
  if (!pkgPreview) {
    throw new PackageOperationError("Package not found.");
  }

  try {
    await validateBookableSlot({
      serviceId: pkgPreview.serviceId as "initial-aap-session" | "aap-transformation-package",
      slotId: `slot-${when.getTime()}`,
      scheduledAt: when.toISOString(),
      displayTimezone: "Europe/Riga",
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new PackageOperationError(error.message);
    }
    throw new PackageOperationError("This time is outside online availability.");
  }

  await prisma.$transaction(async (tx) => {
    const pkg = await tx.sessionPackage.findUnique({
      where: { id: packageId },
      include: {
        sessions: {
          where: { status: { not: "CANCELLED" } },
        },
      },
    });

    if (!pkg) {
      throw new PackageOperationError("Package not found.");
    }

    if (pkg.status !== "ACTIVE") {
      throw new PackageOperationError("This package is no longer active.");
    }

    const usedNumbers = new Set(
      pkg.sessions
        .map((session) => session.sessionNumber)
        .filter((value): value is number => value != null),
    );

    if (usedNumbers.size >= pkg.totalSessions) {
      throw new PackageOperationError("All package sessions are already scheduled.");
    }

    let nextNumber = 1;
    for (let number = 1; number <= pkg.totalSessions; number += 1) {
      if (!usedNumbers.has(number)) {
        nextNumber = number;
        break;
      }
    }

    const service = getServiceById(
      pkg.serviceId as "initial-aap-session" | "aap-transformation-package",
    );

    await tx.session.create({
      data: {
        clientId: pkg.clientId,
        packageId: pkg.id,
        sessionNumber: nextNumber,
        scheduledAt: when,
        sessionType: service?.title ?? "Package session",
        serviceId: pkg.serviceId,
        status: "SCHEDULED",
      },
    });
  });
}

export async function markSessionCompleted(sessionId: string): Promise<void> {
  requireDatabase();

  await prisma.$transaction(async (tx) => {
    const session = await tx.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new PackageOperationError("Session not found.");
    }

    if (session.status === "COMPLETED") {
      return;
    }

    await tx.session.update({
      where: { id: sessionId },
      data: { status: "COMPLETED" },
    });

    if (session.packageId) {
      await syncPackageProgress(tx, session.packageId);
    }
  });
}

export async function listClientPackages(
  clientId: string,
): Promise<ClientPackageRecord[]> {
  requireDatabase();

  const packages = await prisma.sessionPackage.findMany({
    where: { clientId },
    include: {
      sessions: {
        where: { status: { not: "CANCELLED" } },
        orderBy: { sessionNumber: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return packages.map(mapSessionPackageRecord);
}
