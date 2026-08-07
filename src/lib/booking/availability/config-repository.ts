import type { WeeklyAvailability, DailyTimeBlock, BookingSettings } from "@prisma/client";
import { prisma, requireDatabase } from "@/lib/db/prisma";

export type AvailabilityConfig = {
  settings: BookingSettings;
  weekly: WeeklyAvailability[];
  blocks: DailyTimeBlock[];
};

export const DEFAULT_WEEKLY_SCHEDULE: Omit<
  WeeklyAvailability,
  "id"
>[] = [
  { dayOfWeek: 1, enabled: true, startTime: "08:00", endTime: "20:00", note: "" },
  { dayOfWeek: 2, enabled: true, startTime: "08:00", endTime: "20:00", note: "" },
  {
    dayOfWeek: 3,
    enabled: false,
    startTime: "08:00",
    endTime: "20:00",
    note: "Reserved for in-person sessions with Latvian clients.",
  },
  { dayOfWeek: 4, enabled: true, startTime: "08:00", endTime: "20:00", note: "" },
  { dayOfWeek: 5, enabled: true, startTime: "08:00", endTime: "20:00", note: "" },
  { dayOfWeek: 6, enabled: false, startTime: "08:00", endTime: "20:00", note: "" },
  { dayOfWeek: 7, enabled: false, startTime: "08:00", endTime: "20:00", note: "" },
];

export const DEFAULT_DAILY_BLOCKS: Omit<DailyTimeBlock, "id">[] = [
  { startTime: "13:00", endTime: "14:00", label: "Lunch break", active: true },
  { startTime: "19:00", endTime: "20:00", label: "Dinner break", active: true },
];

export async function ensureAvailabilityDefaults(): Promise<void> {
  requireDatabase();

  await prisma.bookingSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      businessTimezone: "Europe/Riga",
      minNoticeHours: 24,
      bufferMinutes: 15,
      horizonDays: 56,
      slotStepMinutes: 15,
    },
    update: {},
  });

  for (const day of DEFAULT_WEEKLY_SCHEDULE) {
    await prisma.weeklyAvailability.upsert({
      where: { dayOfWeek: day.dayOfWeek },
      create: day,
      update: {},
    });
  }

  const blockCount = await prisma.dailyTimeBlock.count();
  if (blockCount === 0) {
    await prisma.dailyTimeBlock.createMany({
      data: DEFAULT_DAILY_BLOCKS,
    });
  }
}

export async function getAvailabilityConfig(): Promise<AvailabilityConfig> {
  requireDatabase();
  await ensureAvailabilityDefaults();

  const [settings, weekly, blocks] = await Promise.all([
    prisma.bookingSettings.findUniqueOrThrow({ where: { id: "default" } }),
    prisma.weeklyAvailability.findMany({ orderBy: { dayOfWeek: "asc" } }),
    prisma.dailyTimeBlock.findMany({ orderBy: { startTime: "asc" } }),
  ]);

  return { settings, weekly, blocks };
}

export type AvailabilitySettingsInput = {
  minNoticeHours: number;
  bufferMinutes: number;
  horizonDays: number;
  slotStepMinutes: number;
};

export type WeeklyAvailabilityInput = {
  dayOfWeek: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
  note: string;
};

export type DailyTimeBlockInput = {
  id?: string;
  startTime: string;
  endTime: string;
  label: string;
  active: boolean;
};

export async function updateAvailabilityConfig(input: {
  settings: AvailabilitySettingsInput;
  weekly: WeeklyAvailabilityInput[];
  blocks: DailyTimeBlockInput[];
}): Promise<AvailabilityConfig> {
  requireDatabase();

  await prisma.bookingSettings.update({
    where: { id: "default" },
    data: {
      minNoticeHours: Math.max(1, input.settings.minNoticeHours || 24),
      bufferMinutes: Math.max(0, input.settings.bufferMinutes || 15),
      horizonDays: Math.min(Math.max(1, input.settings.horizonDays || 56), 90),
      slotStepMinutes: Math.max(1, input.settings.slotStepMinutes || 15),
    },
  });

  for (const day of input.weekly) {
    await prisma.weeklyAvailability.update({
      where: { dayOfWeek: day.dayOfWeek },
      data: {
        enabled: day.enabled,
        startTime: day.startTime,
        endTime: day.endTime,
        note: day.note,
      },
    });
  }

  const existingBlocks = await prisma.dailyTimeBlock.findMany();
  const incomingIds = new Set(input.blocks.map((block) => block.id).filter(Boolean));

  for (const block of existingBlocks) {
    if (!incomingIds.has(block.id)) {
      await prisma.dailyTimeBlock.delete({ where: { id: block.id } });
    }
  }

  for (const block of input.blocks) {
    if (block.id) {
      await prisma.dailyTimeBlock.update({
        where: { id: block.id },
        data: {
          startTime: block.startTime,
          endTime: block.endTime,
          label: block.label,
          active: block.active,
        },
      });
    } else {
      await prisma.dailyTimeBlock.create({
        data: {
          startTime: block.startTime,
          endTime: block.endTime,
          label: block.label,
          active: block.active,
        },
      });
    }
  }

  return getAvailabilityConfig();
}
