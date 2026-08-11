import type { PackageSessionSlot } from "@/lib/admin/client-types";
import { MILESTONE_KEYS, MILESTONE_LABELS, type MilestoneKey } from "./constants";

export type JourneyMilestone = {
  key: MilestoneKey;
  label: string;
  achieved: boolean;
  achievedAt: string | null;
};

function isCompleted(slot: PackageSessionSlot): boolean {
  return slot.status === "completed";
}

export function computePackageMilestones(
  timeline: PackageSessionSlot[],
  options: {
    hasReflection: boolean;
    hasFinalReflection: boolean;
    packageCompleted: boolean;
    journeyStartedAt: string | null;
    persisted: { milestoneKey: string; achievedAt: Date }[];
  },
): JourneyMilestone[] {
  const persistedMap = new Map(
    options.persisted.map((m) => [m.milestoneKey, m.achievedAt.toISOString()]),
  );

  const session1 = timeline.find((s) => s.sessionNumber === 1);
  const session3 = timeline.find((s) => s.sessionNumber === 3);
  const session5 = timeline.find((s) => s.sessionNumber === 5);

  const definitions: { key: MilestoneKey; achieved: boolean; fallbackAt: string | null }[] = [
    {
      key: MILESTONE_KEYS.JOURNEY_STARTED,
      achieved: Boolean(options.journeyStartedAt),
      fallbackAt: options.journeyStartedAt,
    },
    {
      key: MILESTONE_KEYS.FIRST_REFLECTION,
      achieved: options.hasReflection,
      fallbackAt: null,
    },
    {
      key: MILESTONE_KEYS.FIRST_SESSION_COMPLETED,
      achieved: session1 ? isCompleted(session1) : false,
      fallbackAt: session1?.scheduledAt ?? null,
    },
    {
      key: MILESTONE_KEYS.FIRST_BREAKTHROUGH,
      achieved: persistedMap.has(MILESTONE_KEYS.FIRST_BREAKTHROUGH),
      fallbackAt: persistedMap.get(MILESTONE_KEYS.FIRST_BREAKTHROUGH) ?? null,
    },
    {
      key: MILESTONE_KEYS.MIDPOINT,
      achieved: session3 ? isCompleted(session3) : false,
      fallbackAt: session3?.scheduledAt ?? null,
    },
    {
      key: MILESTONE_KEYS.FINAL_SESSION,
      achieved: session5 ? isCompleted(session5) : false,
      fallbackAt: session5?.scheduledAt ?? null,
    },
    {
      key: MILESTONE_KEYS.JOURNEY_COMPLETED,
      achieved: options.packageCompleted && options.hasFinalReflection,
      fallbackAt: null,
    },
  ];

  return definitions.map(({ key, achieved, fallbackAt }) => ({
    key,
    label: MILESTONE_LABELS[key],
    achieved,
    achievedAt: persistedMap.get(key) ?? (achieved ? fallbackAt : null),
  }));
}

export function orderedAchievedMilestones(milestones: JourneyMilestone[]): JourneyMilestone[] {
  return milestones.filter((m) => m.achieved);
}
