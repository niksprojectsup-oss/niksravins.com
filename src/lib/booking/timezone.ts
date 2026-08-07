export const BUSINESS_TIMEZONE = "Europe/Riga";

export type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

export function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const map = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour === "24" ? "0" : map.hour),
    minute: Number(map.minute),
  };
}

/** Convert a local date/time in a specific IANA timezone to a UTC Date. */
export function zonedLocalToUtc(
  dateKey: string,
  timeKey: string,
  timeZone: string,
): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hour, minute] = timeKey.split(":").map(Number);

  let utcMs = Date.UTC(year, month - 1, day, hour, minute);

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = getZonedParts(new Date(utcMs), timeZone);
    const renderedMs = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
    );
    const desiredMs = Date.UTC(year, month - 1, day, hour, minute);
    utcMs += desiredMs - renderedMs;
  }

  return new Date(utcMs);
}

export function getDateKeyInTimeZone(date: Date, timeZone: string): string {
  const parts = getZonedParts(date, timeZone);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTimeKey(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function addDaysToDateKey(
  dateKey: string,
  days: number,
  timeZone: string,
): string {
  const anchor = zonedLocalToUtc(dateKey, "12:00", timeZone);
  anchor.setUTCDate(anchor.getUTCDate() + days);
  return getDateKeyInTimeZone(anchor, timeZone);
}

/** ISO weekday: Monday = 1 … Sunday = 7 */
export function getIsoDayOfWeek(dateKey: string, timeZone: string): number {
  const utc = zonedLocalToUtc(dateKey, "12:00", timeZone);
  const day = utc.getUTCDay();
  return day === 0 ? 7 : day;
}

export function formatInTimeZone(
  iso: string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat("en-GB", {
    ...options,
    timeZone,
  }).format(new Date(iso));
}

export function formatSlotTime(iso: string, timeZone: string): string {
  return formatInTimeZone(iso, timeZone, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatSlotDate(iso: string, timeZone: string): string {
  return formatInTimeZone(iso, timeZone, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatSlotDayTab(iso: string, timeZone: string): string {
  return formatInTimeZone(iso, timeZone, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
