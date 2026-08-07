/**
 * Integration test: package client → complete session 1 → schedule session 2
 *
 * Usage: DATABASE_URL=... npx tsx scripts/test-package-follow-up.ts
 */
import { PrismaClient } from "@prisma/client";
import { ensureAvailabilityDefaults } from "../src/lib/booking/availability/config-repository";
import { getAvailableSlots } from "../src/lib/booking/availability/availability-service";
import {
  getNextSchedulableSessionNumber,
  listClientPackages,
  markSessionCompleted,
  schedulePackageSession,
} from "../src/lib/admin/package-repository";
import { createBooking } from "../src/lib/booking/booking-repository";

const prisma = new PrismaClient();

async function main() {
  await ensureAvailabilityDefaults();

  const testEmail = `package-test-${Date.now()}@example.com`;
  const availability = await getAvailableSlots("aap-transformation-package", "Europe/Riga");
  const firstSlot = availability.flatMap((day) => day.slots).find((slot) => slot.available);

  if (!firstSlot) {
    throw new Error("No available slots found for testing.");
  }

  console.log("Creating package booking for session 1…");
  await createBooking({
    serviceId: "aap-transformation-package",
    slotId: firstSlot.id,
    scheduledAt: firstSlot.startTime,
    client: {
      firstName: "Package",
      lastName: "Tester",
      email: testEmail,
      country: "Latvia",
      timezone: "Europe/Riga",
      sessionIntention: "Initial package session",
    },
  });

  const client = await prisma.client.findUnique({ where: { email: testEmail } });
  if (!client) throw new Error("Client not created.");

  let packages = await listClientPackages(client.id);
  const pkg = packages[0];
  if (!pkg) throw new Error("Package not created.");

  console.log("Package after purchase:", {
    total: pkg.totalSessions,
    completed: pkg.completedSessions,
    remaining: pkg.remainingSessions,
    canScheduleNext: pkg.canScheduleNext,
    nextSchedulableSessionNumber: pkg.nextSchedulableSessionNumber,
  });

  if (pkg.canScheduleNext) {
    throw new Error("Expected canScheduleNext=false before session 1 is completed.");
  }

  const session1 = pkg.timeline.find((slot) => slot.sessionNumber === 1);
  if (!session1?.sessionId) throw new Error("Session 1 not found.");

  console.log("Marking session 1 completed…");
  await markSessionCompleted(session1.sessionId);

  packages = await listClientPackages(client.id);
  const afterComplete = packages[0];
  console.log("Package after session 1 completed:", {
    total: afterComplete.totalSessions,
    completed: afterComplete.completedSessions,
    remaining: afterComplete.remainingSessions,
    status: afterComplete.status,
    canScheduleNext: afterComplete.canScheduleNext,
    nextSchedulableSessionNumber: afterComplete.nextSchedulableSessionNumber,
  });

  if (afterComplete.completedSessions !== 1) {
    throw new Error(`Expected completedSessions=1, got ${afterComplete.completedSessions}`);
  }
  if (afterComplete.remainingSessions !== 4) {
    throw new Error(`Expected remainingSessions=4, got ${afterComplete.remainingSessions}`);
  }
  if (afterComplete.status !== "active") {
    throw new Error(`Expected package status active, got ${afterComplete.status}`);
  }
  if (!afterComplete.canScheduleNext || afterComplete.nextSchedulableSessionNumber !== 2) {
    throw new Error("Expected next schedulable session to be 2.");
  }

  const followUpSlot = availability
    .flatMap((day) => day.slots)
    .find((slot) => slot.available && slot.id !== firstSlot.id);

  if (!followUpSlot) {
    throw new Error("No second available slot found for testing.");
  }

  console.log("Scheduling session 2…");
  await schedulePackageSession(
    afterComplete.id,
    {
      slotId: followUpSlot.id,
      scheduledAt: followUpSlot.startTime,
      mainTopic: "Follow-up package session",
    },
    { clientId: client.id },
  );

  packages = await listClientPackages(client.id);
  const afterSchedule = packages[0];
  const session2 = afterSchedule.timeline.find((slot) => slot.sessionNumber === 2);

  console.log("Package after scheduling session 2:", {
    canScheduleNext: afterSchedule.canScheduleNext,
    session2Status: session2?.status,
    session2At: session2?.scheduledAt,
  });

  if (!session2 || session2.status !== "scheduled") {
    throw new Error("Session 2 was not scheduled.");
  }
  if (afterSchedule.canScheduleNext) {
    throw new Error("Expected canScheduleNext=false while session 2 is scheduled but incomplete.");
  }

  const nextNumber = getNextSchedulableSessionNumber(
    afterSchedule.completedSessions,
    afterSchedule.totalSessions,
    afterSchedule.timeline,
  );
  if (nextNumber != null) {
    throw new Error(`Expected no next schedulable session until session 2 is completed, got ${nextNumber}`);
  }

  console.log("Cleaning up test data…");
  await prisma.client.delete({ where: { id: client.id } });

  console.log("PASS: package follow-up flow works end-to-end.");
}

main()
  .catch((error) => {
    console.error("FAIL:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
