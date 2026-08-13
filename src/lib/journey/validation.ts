import type { CheckInMoodKey } from "./constants";
import { CHECK_IN_MOODS, EMOTION_TAGS, LEGACY_EMOTION_TAGS } from "./constants";

const MOOD_KEYS = new Set<string>(CHECK_IN_MOODS.map((m) => m.key));
const EMOTION_SET = new Set<string>([...EMOTION_TAGS, ...LEGACY_EMOTION_TAGS]);

export function clampScore(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function isValidAssessmentScore(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 10 && Number.isInteger(value);
}

export function isValidSessionRating(value: number): boolean {
  return Number.isFinite(value) && value >= 1 && value <= 5 && Number.isInteger(value);
}

export function isValidCheckInMood(value: string): value is CheckInMoodKey {
  return MOOD_KEYS.has(value);
}

export function sanitizeEmotionTags(tags: string[]): string[] {
  const unique = new Set<string>();
  for (const tag of tags) {
    const trimmed = tag.trim();
    if (trimmed && EMOTION_SET.has(trimmed)) {
      unique.add(trimmed);
    }
  }
  return Array.from(unique);
}

export function isValidCheckInDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function getTodayInTimezone(timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
