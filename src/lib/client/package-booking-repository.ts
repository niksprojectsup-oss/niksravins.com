import {
  PackageOperationError,
  schedulePackageSession,
} from "@/lib/admin/package-repository";
import { prisma, requireDatabase } from "@/lib/db/prisma";

export async function getClientPackageForBooking(
  clientId: string,
  packageId: string,
) {
  requireDatabase();

  const pkg = await prisma.sessionPackage.findFirst({
    where: { id: packageId, clientId },
    include: {
      sessions: {
        where: { status: { not: "CANCELLED" } },
        orderBy: { sessionNumber: "asc" },
      },
    },
  });

  if (!pkg || pkg.status !== "ACTIVE") {
    return null;
  }

  const scheduledCount = pkg.sessions.filter((s) => s.sessionNumber != null).length;
  if (scheduledCount >= pkg.totalSessions) {
    return null;
  }

  return pkg;
}

export { PackageOperationError };
