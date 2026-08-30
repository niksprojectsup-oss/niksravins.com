import { prisma, requireDatabase } from "@/lib/db/prisma";
import { mapSessionPackageRecord } from "@/lib/admin/package-repository";
import { computePackageMilestones } from "./milestones";
import type { AssessmentDimensionKey } from "./constants";
import { ASSESSMENT_DIMENSIONS } from "./constants";

export type AdminTransformationOverview = {
  package: {
    id: string;
    serviceTitle: string;
    completedSessions: number;
    remainingSessions: number;
    status: string;
  } | null;
  latestCheckIn: {
    checkInDate: string;
    mood: string;
    intensity: number;
    emotionTags: string[];
  } | null;
  latestSharedJournal: {
    id: string;
    content: string;
    prompt: string;
    createdAt: string;
  } | null;
  latestSharedReflection: {
    sessionId: string;
    rating: number;
    valuablePart: string;
    whatShifted: string;
    takeaway: string;
    messageToPractitioner: string;
    createdAt: string;
  } | null;
  goals: {
    id: string;
    title: string;
    status: string;
  }[];
  assessmentTrend: {
    key: AssessmentDimensionKey;
    label: string;
    starting: number | null;
    current: number | null;
    inverted: boolean;
  }[];
  milestones: ReturnType<typeof computePackageMilestones>;
};

export async function getAdminTransformationOverview(
  clientId: string,
): Promise<AdminTransformationOverview> {
  requireDatabase();

  const [
    activePackage,
    latestCheckIn,
    latestSharedJournal,
    latestSharedReflection,
    goals,
    assessments,
    reflectionsCount,
    finalReflection,
    persistedMilestones,
  ] = await Promise.all([
    prisma.sessionPackage.findFirst({
      where: { clientId, status: { in: ["ACTIVE", "COMPLETED"] } },
      include: {
        sessions: {
          where: { status: { not: "CANCELLED" } },
          orderBy: { sessionNumber: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.clientCheckIn.findFirst({
      where: { clientId },
      orderBy: { checkInDate: "desc" },
    }),
    prisma.clientJournalEntry.findFirst({
      where: { clientId, visibility: "SHARED" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.sessionReflection.findFirst({
      where: { clientId, sharedWithPractitioner: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.clientGoal.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.clientSelfAssessment.findMany({
      where: { clientId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.sessionReflection.count({ where: { clientId } }),
    prisma.journeyFinalReflection.findFirst({
      where: { clientId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.clientMilestone.findMany({ where: { clientId } }),
  ]);

  let packageSummary: AdminTransformationOverview["package"] = null;
  let milestones: AdminTransformationOverview["milestones"] = [];

  if (activePackage) {
    const mapped = await mapSessionPackageRecord(activePackage);
    packageSummary = {
      id: mapped.id,
      serviceTitle: mapped.serviceTitle,
      completedSessions: mapped.completedSessions,
      remainingSessions: mapped.remainingSessions,
      status: mapped.status,
    };
    milestones = computePackageMilestones(mapped.timeline, {
      hasReflection: reflectionsCount > 0,
      hasFinalReflection: Boolean(finalReflection),
      packageCompleted: activePackage.status === "COMPLETED",
      journeyStartedAt: activePackage.createdAt.toISOString(),
      persisted: persistedMilestones,
    });
  }

  const before = assessments.find((a) => a.phase === "BEFORE") ?? assessments[0];
  const current = assessments[assessments.length - 1];

  return {
    package: packageSummary,
    latestCheckIn: latestCheckIn
      ? {
          checkInDate: latestCheckIn.checkInDate,
          mood: latestCheckIn.mood,
          intensity: latestCheckIn.intensity,
          emotionTags: latestCheckIn.emotionTags,
        }
      : null,
    latestSharedJournal: latestSharedJournal
      ? {
          id: latestSharedJournal.id,
          content: latestSharedJournal.content,
          prompt: latestSharedJournal.prompt,
          createdAt: latestSharedJournal.createdAt.toISOString(),
        }
      : null,
    latestSharedReflection: latestSharedReflection
      ? {
          sessionId: latestSharedReflection.sessionId,
          rating: latestSharedReflection.rating,
          valuablePart: latestSharedReflection.valuablePart,
          whatShifted: latestSharedReflection.whatShifted,
          takeaway: latestSharedReflection.takeaway,
          messageToPractitioner: latestSharedReflection.messageToPractitioner,
          createdAt: latestSharedReflection.createdAt.toISOString(),
        }
      : null,
    goals: goals.map((g) => ({ id: g.id, title: g.title, status: g.status })),
    assessmentTrend: ASSESSMENT_DIMENSIONS.map((d) => ({
      key: d.key,
      label: d.label,
      inverted: d.inverted,
      starting: before ? before[d.key] : null,
      current: current ? current[d.key] : null,
    })),
    milestones,
  };
}

export type AdminSharedSessionReflection = {
  sessionId: string;
  rating: number;
  valuablePart: string;
  whatShifted: string;
  takeaway: string;
  messageToPractitioner: string;
};

export async function getAdminSharedSessionReflections(clientId: string) {
  requireDatabase();
  const reflections = await prisma.sessionReflection.findMany({
    where: { clientId, sharedWithPractitioner: true },
    orderBy: { createdAt: "desc" },
  });
  return reflections.map(
    (r): AdminSharedSessionReflection => ({
      sessionId: r.sessionId,
      rating: r.rating,
      valuablePart: r.valuablePart,
      whatShifted: r.whatShifted,
      takeaway: r.takeaway,
      messageToPractitioner: r.messageToPractitioner,
    }),
  );
}

/** Admin-only: never returns PRIVATE journal entries */
export async function listAdminSharedJournalEntries(clientId: string) {
  requireDatabase();
  return prisma.clientJournalEntry.findMany({
    where: { clientId, visibility: "SHARED" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      prompt: true,
      createdAt: true,
    },
  });
}
