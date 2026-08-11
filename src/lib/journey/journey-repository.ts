import type { PackageSessionSlot } from "@/lib/admin/client-types";
import { mapSessionPackageRecord } from "@/lib/admin/package-repository";
import type {
  AssessmentPhase,
  CheckInMood,
  GoalStatus,
  JournalVisibility,
  TestimonialConsent,
} from "@prisma/client";
import { prisma, requireDatabase } from "@/lib/db/prisma";
import {
  assertClientOwnsGoal,
  assertClientOwnsJournalEntry,
  assertClientOwnsPackage,
  assertClientOwnsSession,
} from "./ownership";
import { computePackageMilestones, type JourneyMilestone } from "./milestones";
import type { AssessmentDimensionKey } from "./constants";
import { ASSESSMENT_DIMENSIONS } from "./constants";
import { getTodayInTimezone } from "./validation";

export type JourneyJournalEntry = {
  id: string;
  content: string;
  prompt: string;
  visibility: JournalVisibility;
  createdAt: string;
  updatedAt: string;
};

export type JourneyCheckIn = {
  id: string;
  checkInDate: string;
  mood: CheckInMood;
  emotionTags: string[];
  intensity: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type JourneyGoal = {
  id: string;
  title: string;
  description: string;
  status: GoalStatus;
  createdAt: string;
  completedAt: string | null;
};

export type JourneySelfAssessment = {
  id: string;
  phase: AssessmentPhase;
  clarity: number;
  confidence: number;
  connection: number;
  movingForward: number;
  emotionalBalance: number;
  feelingStuck: number;
  packageId: string | null;
  createdAt: string;
};

export type JourneySessionReflection = {
  id: string;
  sessionId: string;
  rating: number;
  valuablePart: string;
  whatShifted: string;
  takeaway: string;
  messageToPractitioner: string;
  sharedWithPractitioner: boolean;
  createdAt: string;
  updatedAt: string;
};

export type JourneySessionPreparation = {
  sessionId: string;
  reflection: string;
  updatedAt: string;
};

export type JourneyNextSession = {
  id: string;
  sessionType: string;
  sessionNumber: number | null;
  packageId: string | null;
  serviceTitle: string | null;
  scheduledAt: string;
  status: string;
  meetingLink: string | null;
};

export type JourneyDashboardData = {
  firstName: string;
  timezone: string;
  activePackage: {
    id: string;
    serviceTitle: string;
    timeline: PackageSessionSlot[];
    milestones: JourneyMilestone[];
  } | null;
  nextSession: JourneyNextSession | null;
  preparation: JourneySessionPreparation | null;
  todayCheckIn: JourneyCheckIn | null;
  activeGoals: JourneyGoal[];
  progressPreview: {
    hasAssessments: boolean;
    dimensions: {
      key: AssessmentDimensionKey;
      label: string;
      inverted: boolean;
      starting: number | null;
      current: number | null;
    }[];
  };
};

export type JourneyProgressData = {
  assessments: JourneySelfAssessment[];
  goals: JourneyGoal[];
  progressTable: JourneyDashboardData["progressPreview"];
  checkIns: JourneyCheckIn[];
};

function meetingLinkFromEnv(): string | null {
  const link = process.env.SESSION_MEETING_URL?.trim();
  return link || null;
}

function mapJournal(entry: {
  id: string;
  content: string;
  prompt: string;
  visibility: JournalVisibility;
  createdAt: Date;
  updatedAt: Date;
}): JourneyJournalEntry {
  return {
    id: entry.id,
    content: entry.content,
    prompt: entry.prompt,
    visibility: entry.visibility,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };
}

function mapCheckIn(entry: {
  id: string;
  checkInDate: string;
  mood: CheckInMood;
  emotionTags: string[];
  intensity: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}): JourneyCheckIn {
  return {
    id: entry.id,
    checkInDate: entry.checkInDate,
    mood: entry.mood,
    emotionTags: entry.emotionTags,
    intensity: entry.intensity,
    notes: entry.notes,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };
}

function mapGoal(entry: {
  id: string;
  title: string;
  description: string;
  status: GoalStatus;
  createdAt: Date;
  completedAt: Date | null;
}): JourneyGoal {
  return {
    id: entry.id,
    title: entry.title,
    description: entry.description,
    status: entry.status,
    createdAt: entry.createdAt.toISOString(),
    completedAt: entry.completedAt?.toISOString() ?? null,
  };
}

function mapAssessment(entry: {
  id: string;
  phase: AssessmentPhase;
  clarity: number;
  confidence: number;
  connection: number;
  movingForward: number;
  emotionalBalance: number;
  feelingStuck: number;
  packageId: string | null;
  createdAt: Date;
}): JourneySelfAssessment {
  return {
    id: entry.id,
    phase: entry.phase,
    clarity: entry.clarity,
    confidence: entry.confidence,
    connection: entry.connection,
    movingForward: entry.movingForward,
    emotionalBalance: entry.emotionalBalance,
    feelingStuck: entry.feelingStuck,
    packageId: entry.packageId,
    createdAt: entry.createdAt.toISOString(),
  };
}

function buildProgressPreview(
  assessments: JourneySelfAssessment[],
): JourneyDashboardData["progressPreview"] {
  if (assessments.length === 0) {
    return {
      hasAssessments: false,
      dimensions: ASSESSMENT_DIMENSIONS.map((d) => ({
        key: d.key,
        label: d.label,
        inverted: d.inverted,
        starting: null,
        current: null,
      })),
    };
  }

  const before =
    assessments.find((a) => a.phase === "BEFORE") ??
    assessments[assessments.length - 1];
  const current = assessments[assessments.length - 1];

  return {
    hasAssessments: true,
    dimensions: ASSESSMENT_DIMENSIONS.map((d) => ({
      key: d.key,
      label: d.label,
      inverted: d.inverted,
      starting: before[d.key],
      current: current[d.key],
    })),
  };
}

async function getActivePackage(clientId: string) {
  const pkg = await prisma.sessionPackage.findFirst({
    where: { clientId, status: "ACTIVE" },
    include: {
      sessions: {
        where: { status: { not: "CANCELLED" } },
        orderBy: { sessionNumber: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return pkg;
}

export async function getJourneyDashboard(
  clientId: string,
): Promise<JourneyDashboardData | null> {
  requireDatabase();

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      firstName: true,
      timezone: true,
    },
  });
  if (!client) return null;

  const today = getTodayInTimezone(client.timezone);
  const activePackageRecord = await getActivePackage(clientId);

  const [
    todayCheckIn,
    activeGoals,
    assessments,
    reflectionsCount,
    finalReflection,
    persistedMilestones,
    nextSessionDb,
  ] = await Promise.all([
    prisma.clientCheckIn.findUnique({
      where: { clientId_checkInDate: { clientId, checkInDate: today } },
    }),
    prisma.clientGoal.findMany({
      where: { clientId, status: { not: "COMPLETED" } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.clientSelfAssessment.findMany({
      where: { clientId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.sessionReflection.count({ where: { clientId } }),
    activePackageRecord
      ? prisma.journeyFinalReflection.findUnique({
          where: { packageId: activePackageRecord.id },
        })
      : Promise.resolve(null),
    prisma.clientMilestone.findMany({ where: { clientId } }),
    prisma.session.findFirst({
      where: {
        clientId,
        status: "SCHEDULED",
        scheduledAt: { gt: new Date() },
      },
      orderBy: { scheduledAt: "asc" },
      include: { package: true },
    }),
  ]);

  const preparationRow = nextSessionDb
    ? await prisma.sessionPreparation.findUnique({
        where: { sessionId: nextSessionDb.id },
      })
    : null;

  let activePackage: JourneyDashboardData["activePackage"] = null;
  if (activePackageRecord) {
    const mapped = mapSessionPackageRecord(activePackageRecord);
    activePackage = {
      id: mapped.id,
      serviceTitle: mapped.serviceTitle,
      timeline: mapped.timeline,
      milestones: computePackageMilestones(mapped.timeline, {
        hasReflection: reflectionsCount > 0,
        hasFinalReflection: Boolean(finalReflection),
        packageCompleted: activePackageRecord.status === "COMPLETED",
        journeyStartedAt: activePackageRecord.createdAt.toISOString(),
        persisted: persistedMilestones,
      }),
    };
  }

  let nextSession: JourneyNextSession | null = null;
  if (nextSessionDb) {
    const serviceTitle = nextSessionDb.package
      ? mapSessionPackageRecord({
          ...nextSessionDb.package,
          sessions: [],
        }).serviceTitle
      : nextSessionDb.sessionType;

    nextSession = {
      id: nextSessionDb.id,
      sessionType: nextSessionDb.sessionType,
      sessionNumber: nextSessionDb.sessionNumber,
      packageId: nextSessionDb.packageId,
      serviceTitle,
      scheduledAt: nextSessionDb.scheduledAt.toISOString(),
      status: nextSessionDb.status,
      meetingLink: meetingLinkFromEnv(),
    };
  }

  const mappedAssessments = assessments.map(mapAssessment);

  return {
    firstName: client.firstName,
    timezone: client.timezone,
    activePackage,
    nextSession,
    preparation: preparationRow
      ? {
          sessionId: preparationRow.sessionId,
          reflection: preparationRow.reflection,
          updatedAt: preparationRow.updatedAt.toISOString(),
        }
      : null,
    todayCheckIn: todayCheckIn ? mapCheckIn(todayCheckIn) : null,
    activeGoals: activeGoals.map(mapGoal),
    progressPreview: buildProgressPreview(mappedAssessments),
  };
}

export async function listJournalEntries(
  clientId: string,
): Promise<JourneyJournalEntry[]> {
  requireDatabase();
  const entries = await prisma.clientJournalEntry.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });
  return entries.map(mapJournal);
}

export async function createJournalEntry(
  clientId: string,
  input: { content: string; prompt: string; visibility: JournalVisibility },
) {
  requireDatabase();
  const entry = await prisma.clientJournalEntry.create({
    data: { clientId, ...input },
  });
  return mapJournal(entry);
}

export async function updateJournalEntry(
  clientId: string,
  entryId: string,
  input: { content: string; prompt: string; visibility: JournalVisibility },
) {
  await assertClientOwnsJournalEntry(clientId, entryId);
  const entry = await prisma.clientJournalEntry.update({
    where: { id: entryId },
    data: input,
  });
  return mapJournal(entry);
}

export async function deleteJournalEntry(clientId: string, entryId: string) {
  await assertClientOwnsJournalEntry(clientId, entryId);
  await prisma.clientJournalEntry.delete({ where: { id: entryId } });
}

export async function getTodayCheckIn(clientId: string, timezone: string) {
  requireDatabase();
  const today = getTodayInTimezone(timezone);
  const checkIn = await prisma.clientCheckIn.findUnique({
    where: { clientId_checkInDate: { clientId, checkInDate: today } },
  });
  return checkIn ? mapCheckIn(checkIn) : null;
}

export async function upsertCheckIn(
  clientId: string,
  timezone: string,
  input: {
    mood: CheckInMood;
    emotionTags: string[];
    intensity: number;
    notes: string;
  },
) {
  requireDatabase();
  const today = getTodayInTimezone(timezone);
  const checkIn = await prisma.clientCheckIn.upsert({
    where: { clientId_checkInDate: { clientId, checkInDate: today } },
    create: { clientId, checkInDate: today, ...input },
    update: input,
  });
  return mapCheckIn(checkIn);
}

export async function listCheckIns(clientId: string): Promise<JourneyCheckIn[]> {
  requireDatabase();
  const checkIns = await prisma.clientCheckIn.findMany({
    where: { clientId },
    orderBy: { checkInDate: "asc" },
  });
  return checkIns.map(mapCheckIn);
}

export async function listGoals(clientId: string): Promise<JourneyGoal[]> {
  requireDatabase();
  const goals = await prisma.clientGoal.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });
  return goals.map(mapGoal);
}

export async function createGoal(
  clientId: string,
  input: { title: string; description: string },
) {
  requireDatabase();
  const goal = await prisma.clientGoal.create({
    data: { clientId, ...input },
  });
  return mapGoal(goal);
}

export async function updateGoal(
  clientId: string,
  goalId: string,
  input: { title?: string; description?: string; status?: GoalStatus },
) {
  await assertClientOwnsGoal(clientId, goalId);
  const completedAt =
    input.status === "COMPLETED" ? new Date() : input.status ? null : undefined;
  const goal = await prisma.clientGoal.update({
    where: { id: goalId },
    data: {
      ...input,
      ...(completedAt !== undefined ? { completedAt } : {}),
    },
  });
  return mapGoal(goal);
}

export async function createSelfAssessment(
  clientId: string,
  input: {
    phase: AssessmentPhase;
    clarity: number;
    confidence: number;
    connection: number;
    movingForward: number;
    emotionalBalance: number;
    feelingStuck: number;
    packageId?: string | null;
  },
) {
  requireDatabase();
  if (input.packageId) {
    await assertClientOwnsPackage(clientId, input.packageId);
  }
  const assessment = await prisma.clientSelfAssessment.create({
    data: { clientId, ...input },
  });
  return mapAssessment(assessment);
}

export async function getJourneyProgress(
  clientId: string,
): Promise<JourneyProgressData> {
  requireDatabase();
  const [assessments, goals, checkIns] = await Promise.all([
    prisma.clientSelfAssessment.findMany({
      where: { clientId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.clientGoal.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.clientCheckIn.findMany({
      where: { clientId },
      orderBy: { checkInDate: "asc" },
    }),
  ]);
  const mappedAssessments = assessments.map(mapAssessment);
  return {
    assessments: mappedAssessments,
    goals: goals.map(mapGoal),
    progressTable: buildProgressPreview(mappedAssessments),
    checkIns: checkIns.map(mapCheckIn),
  };
}

export async function upsertSessionPreparation(
  clientId: string,
  sessionId: string,
  reflection: string,
) {
  await assertClientOwnsSession(clientId, sessionId);
  const row = await prisma.sessionPreparation.upsert({
    where: { sessionId },
    create: { clientId, sessionId, reflection },
    update: { reflection },
  });
  return {
    sessionId: row.sessionId,
    reflection: row.reflection,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getSessionReflection(
  clientId: string,
  sessionId: string,
): Promise<JourneySessionReflection | null> {
  await assertClientOwnsSession(clientId, sessionId);
  const reflection = await prisma.sessionReflection.findUnique({
    where: { sessionId },
  });
  if (!reflection || reflection.clientId !== clientId) return null;
  return {
    id: reflection.id,
    sessionId: reflection.sessionId,
    rating: reflection.rating,
    valuablePart: reflection.valuablePart,
    whatShifted: reflection.whatShifted,
    takeaway: reflection.takeaway,
    messageToPractitioner: reflection.messageToPractitioner,
    sharedWithPractitioner: reflection.sharedWithPractitioner,
    createdAt: reflection.createdAt.toISOString(),
    updatedAt: reflection.updatedAt.toISOString(),
  };
}

export async function upsertSessionReflection(
  clientId: string,
  sessionId: string,
  input: {
    rating: number;
    valuablePart: string;
    whatShifted: string;
    takeaway: string;
    messageToPractitioner: string;
    sharedWithPractitioner: boolean;
  },
) {
  await assertClientOwnsSession(clientId, sessionId);
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session || session.status !== "COMPLETED") {
    throw new Error("Reflection is available after a completed session.");
  }

  const reflection = await prisma.sessionReflection.upsert({
    where: { sessionId },
    create: { clientId, sessionId, ...input },
    update: input,
  });
  return {
    id: reflection.id,
    sessionId: reflection.sessionId,
    rating: reflection.rating,
    valuablePart: reflection.valuablePart,
    whatShifted: reflection.whatShifted,
    takeaway: reflection.takeaway,
    messageToPractitioner: reflection.messageToPractitioner,
    sharedWithPractitioner: reflection.sharedWithPractitioner,
    createdAt: reflection.createdAt.toISOString(),
    updatedAt: reflection.updatedAt.toISOString(),
  };
}

export type JourneySessionListItem = {
  id: string;
  sessionType: string;
  sessionNumber: number | null;
  scheduledAt: string;
  status: string;
  reflection: JourneySessionReflection | null;
  needsReflection: boolean;
};

export async function listClientSessionsWithReflections(
  clientId: string,
): Promise<JourneySessionListItem[]> {
  requireDatabase();
  const sessions = await prisma.session.findMany({
    where: { clientId, status: { not: "CANCELLED" } },
    orderBy: { scheduledAt: "desc" },
    include: { reflection: true },
  });

  const now = Date.now();
  return sessions.map((session) => {
    const isCompleted =
      session.status === "COMPLETED" ||
      (session.status === "SCHEDULED" && session.scheduledAt.getTime() <= now);

    const reflection =
      session.reflection && session.reflection.clientId === clientId
        ? {
            id: session.reflection.id,
            sessionId: session.reflection.sessionId,
            rating: session.reflection.rating,
            valuablePart: session.reflection.valuablePart,
            whatShifted: session.reflection.whatShifted,
            takeaway: session.reflection.takeaway,
            messageToPractitioner: session.reflection.messageToPractitioner,
            sharedWithPractitioner: session.reflection.sharedWithPractitioner,
            createdAt: session.reflection.createdAt.toISOString(),
            updatedAt: session.reflection.updatedAt.toISOString(),
          }
        : null;

    return {
      id: session.id,
      sessionType: session.sessionType,
      sessionNumber: session.sessionNumber,
      scheduledAt: session.scheduledAt.toISOString(),
      status: session.status,
      reflection,
      needsReflection: isCompleted && session.status === "COMPLETED" && !reflection,
    };
  });
}

export async function getJourneyPageData(clientId: string) {
  requireDatabase();
  const activePackageRecord = await getActivePackage(clientId);
  if (!activePackageRecord) {
    return { activePackage: null, milestones: [] as JourneyMilestone[] };
  }

  const [reflectionsCount, finalReflection, persistedMilestones] = await Promise.all([
    prisma.sessionReflection.count({ where: { clientId } }),
    prisma.journeyFinalReflection.findUnique({
      where: { packageId: activePackageRecord.id },
    }),
    prisma.clientMilestone.findMany({ where: { clientId } }),
  ]);

  const mapped = mapSessionPackageRecord(activePackageRecord);
  return {
    activePackage: {
      id: mapped.id,
      serviceTitle: mapped.serviceTitle,
      timeline: mapped.timeline,
      totalSessions: mapped.totalSessions,
      completedSessions: mapped.completedSessions,
      remainingSessions: mapped.remainingSessions,
    },
    milestones: computePackageMilestones(mapped.timeline, {
      hasReflection: reflectionsCount > 0,
      hasFinalReflection: Boolean(finalReflection),
      packageCompleted: activePackageRecord.status === "COMPLETED",
      journeyStartedAt: activePackageRecord.createdAt.toISOString(),
      persisted: persistedMilestones,
    }),
  };
}

export async function upsertFinalReflection(
  clientId: string,
  packageId: string,
  input: {
    whatChanged: string;
    mostValuable: string;
    selfDiscovery: string;
    takeForward: string;
    recommendation: string;
    rating: number;
  },
) {
  await assertClientOwnsPackage(clientId, packageId);
  const row = await prisma.journeyFinalReflection.upsert({
    where: { packageId },
    create: { clientId, packageId, ...input },
    update: input,
  });
  return row;
}

export async function upsertTestimonial(
  clientId: string,
  packageId: string,
  input: { content: string; consent: TestimonialConsent },
) {
  await assertClientOwnsPackage(clientId, packageId);
  const row = await prisma.testimonial.upsert({
    where: { packageId },
    create: {
      clientId,
      packageId,
      content: input.content,
      consent: input.consent,
      status: input.consent === "PRIVATE" ? "PENDING" : "PENDING",
    },
    update: {
      content: input.content,
      consent: input.consent,
      status: "PENDING",
    },
  });
  return row;
}

export async function getFinalReflectionState(clientId: string, packageId: string) {
  await assertClientOwnsPackage(clientId, packageId);
  const [finalReflection, testimonial] = await Promise.all([
    prisma.journeyFinalReflection.findUnique({ where: { packageId } }),
    prisma.testimonial.findUnique({ where: { packageId } }),
  ]);
  return { finalReflection, testimonial };
}
