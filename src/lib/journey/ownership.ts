import { prisma, requireDatabase } from "@/lib/db/prisma";
import { JourneyForbiddenError } from "./errors";

export async function assertClientOwnsSession(
  clientId: string,
  sessionId: string,
) {
  requireDatabase();
  const session = await prisma.session.findFirst({
    where: { id: sessionId, clientId },
  });
  if (!session) {
    throw new JourneyForbiddenError();
  }
  return session;
}

export async function assertClientOwnsPackage(
  clientId: string,
  packageId: string,
) {
  requireDatabase();
  const pkg = await prisma.sessionPackage.findFirst({
    where: { id: packageId, clientId },
  });
  if (!pkg) {
    throw new JourneyForbiddenError();
  }
  return pkg;
}

export async function assertClientOwnsJournalEntry(
  clientId: string,
  entryId: string,
) {
  requireDatabase();
  const entry = await prisma.clientJournalEntry.findFirst({
    where: { id: entryId, clientId },
  });
  if (!entry) {
    throw new JourneyForbiddenError();
  }
  return entry;
}

export async function assertClientOwnsGoal(clientId: string, goalId: string) {
  requireDatabase();
  const goal = await prisma.clientGoal.findFirst({
    where: { id: goalId, clientId },
  });
  if (!goal) {
    throw new JourneyForbiddenError();
  }
  return goal;
}

export async function assertClientOwnsCheckIn(
  clientId: string,
  checkInId: string,
) {
  requireDatabase();
  const checkIn = await prisma.clientCheckIn.findFirst({
    where: { id: checkInId, clientId },
  });
  if (!checkIn) {
    throw new JourneyForbiddenError();
  }
  return checkIn;
}
