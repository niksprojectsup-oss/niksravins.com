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

export type PackageFollowUpEligibility = {
  eligible: boolean;
  packageId: string;
  clientId: string;
  serviceId: string;
  nextSessionNumber: number;
  completedSessions: number;
  remainingSessions: number;
  totalSessions: number;
};

export type SchedulePackageSessionInput = {
  slotId: string;
  scheduledAt: string;
  mainTopic?: string;
};

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

export function getNextSchedulableSessionNumber(
  completedSessions: number,
  totalSessions: number,
  timeline: PackageSessionSlot[],
): number | null {
  if (completedSessions >= totalSessions) {
    return null;
  }

  const nextSessionNumber = completedSessions + 1;
  const slot = timeline.find((entry) => entry.sessionNumber === nextSessionNumber);

  if (!slot || slot.status !== "not_scheduled") {
    return null;
  }

  return nextSessionNumber;
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

  const timeline = buildPackageTimeline(pkg.totalSessions, pkg.sessions);
  const remainingSessions = pkg.totalSessions - pkg.completedSessions;
  const nextSchedulableSessionNumber = getNextSchedulableSessionNumber(
    pkg.completedSessions,
    pkg.totalSessions,
    timeline,
  );

  return {
    id: pkg.id,
    serviceId: pkg.serviceId,
    serviceTitle,
    totalSessions: pkg.totalSessions,
    completedSessions: pkg.completedSessions,
    remainingSessions,
    status: pkg.status.toLowerCase(),
    createdAt: pkg.createdAt.toISOString(),
    timeline,
    nextSchedulableSessionNumber,
    canScheduleNext: pkg.status === "ACTIVE" && nextSchedulableSessionNumber != null,
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

export async function getPackageFollowUpEligibility(
  email: string,
): Promise<PackageFollowUpEligibility | null> {
  requireDatabase();

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return null;
  }

  const client = await prisma.client.findUnique({
    where: { email: normalizedEmail },
  });
  if (!client) {
    return null;
  }

  const packages = await listClientPackages(client.id);
  const activePackage = packages.find(
    (pkg) => pkg.status === "active" && pkg.serviceId === "aap-transformation-package",
  );

  if (!activePackage || !activePackage.canScheduleNext) {
    return null;
  }

  const nextSessionNumber = activePackage.nextSchedulableSessionNumber;
  if (nextSessionNumber == null) {
    return null;
  }

  return {
    eligible: true,
    packageId: activePackage.id,
    clientId: client.id,
    serviceId: activePackage.serviceId,
    nextSessionNumber,
    completedSessions: activePackage.completedSessions,
    remainingSessions: activePackage.remainingSessions,
    totalSessions: activePackage.totalSessions,
  };
}

export async function schedulePackageSession(
  packageId: string,
  input: SchedulePackageSessionInput,
  options?: { clientId?: string },
): Promise<void> {
  requireDatabase();

  const scheduledAt = new Date(input.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime())) {
    throw new PackageOperationError("Please provide a valid date and time.");
  }

  const pkgPreview = await prisma.sessionPackage.findUnique({
    where: { id: packageId },
    include: {
      sessions: {
        where: { status: { not: "CANCELLED" } },
      },
    },
  });
  if (!pkgPreview) {
    throw new PackageOperationError("Package not found.");
  }

  if (options?.clientId && pkgPreview.clientId !== options.clientId) {
    throw new PackageOperationError("Package does not belong to this client.");
  }

  const previewRecord = mapSessionPackageRecord(pkgPreview);
  const nextSessionNumber = previewRecord.nextSchedulableSessionNumber;
  if (previewRecord.status !== "active" || nextSessionNumber == null) {
    throw new PackageOperationError(
      "Complete the current session before scheduling the next one.",
    );
  }

  try {
    await validateBookableSlot({
      serviceId: pkgPreview.serviceId as "initial-aap-session" | "aap-transformation-package",
      slotId: input.slotId,
      scheduledAt: input.scheduledAt,
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

    const liveRecord = mapSessionPackageRecord(pkg);
    const sessionNumber = liveRecord.nextSchedulableSessionNumber;
    if (sessionNumber == null) {
      throw new PackageOperationError(
        "Complete the current session before scheduling the next one.",
      );
    }

    const usedNumbers = new Set(
      pkg.sessions
        .map((session) => session.sessionNumber)
        .filter((value): value is number => value != null),
    );

    if (usedNumbers.has(sessionNumber)) {
      throw new PackageOperationError("This package session is already scheduled.");
    }

    const service = getServiceById(
      pkg.serviceId as "initial-aap-session" | "aap-transformation-package",
    );

    await tx.session.create({
      data: {
        clientId: pkg.clientId,
        packageId: pkg.id,
        sessionNumber,
        scheduledAt,
        sessionType: service?.title ?? "Package session",
        serviceId: pkg.serviceId,
        status: "SCHEDULED",
        mainTopic: input.mainTopic?.trim() ?? "",
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

export async function clientHasActivePackage(
  clientId: string,
  serviceId: string,
): Promise<boolean> {
  requireDatabase();

  const existing = await prisma.sessionPackage.findFirst({
    where: {
      clientId,
      serviceId,
      status: "ACTIVE",
    },
  });

  return existing != null;
}
