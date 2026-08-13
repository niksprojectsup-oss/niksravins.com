import { formatSlotDate, formatSlotTime } from "@/lib/booking/timezone";
import { getAppBaseUrl } from "@/lib/url";

export type SessionCalendarEventInput = {
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  timezone: string;
  description?: string;
  meetingLink?: string | null;
  location?: string;
};

function toGoogleUtcStamp(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function foldIcsLine(line: string): string {
  const chunks: string[] = [];
  let remaining = line;
  while (remaining.length > 73) {
    chunks.push(`${remaining.slice(0, 73)}\r\n `);
    remaining = remaining.slice(73);
  }
  chunks.push(remaining);
  return chunks.join("");
}

export function buildSessionCalendarDescription(
  input: Pick<SessionCalendarEventInput, "timezone" | "description" | "meetingLink">,
): string {
  const lines = [
    input.description ?? "Online session with Niks Ravins.",
    `Timezone: ${input.timezone}`,
    "This session takes place online.",
  ];
  if (input.meetingLink) {
    lines.push(`Meeting link: ${input.meetingLink}`);
  }
  return lines.join("\n");
}

export function buildGoogleCalendarUrl(input: SessionCalendarEventInput): string {
  const start = new Date(input.scheduledAt);
  const end = new Date(start.getTime() + input.durationMinutes * 60_000);
  const description = buildSessionCalendarDescription(input);
  const location = input.meetingLink ?? input.location ?? "Online";

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title,
    dates: `${toGoogleUtcStamp(start)}/${toGoogleUtcStamp(end)}`,
    details: description,
    location,
    ctz: input.timezone,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcsContent(input: SessionCalendarEventInput): string {
  const start = new Date(input.scheduledAt);
  const end = new Date(start.getTime() + input.durationMinutes * 60_000);
  const uid = `${start.getTime()}-${input.title.replace(/\s+/g, "-").toLowerCase()}@niksravins.com`;
  const description = buildSessionCalendarDescription(input);
  const location = input.meetingLink ?? input.location ?? "Online";
  const now = toGoogleUtcStamp(new Date());

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Niks Ravins//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${toGoogleUtcStamp(start)}`,
    `DTEND:${toGoogleUtcStamp(end)}`,
    foldIcsLine(`SUMMARY:${escapeIcsText(input.title)}`),
    foldIcsLine(`DESCRIPTION:${escapeIcsText(description)}`),
    foldIcsLine(`LOCATION:${escapeIcsText(location)}`),
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `${lines.join("\r\n")}\r\n`;
}

export function buildBookingCalendarLinks(input: {
  token: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  timezone: string;
  description?: string;
  meetingLink?: string | null;
}) {
  const event: SessionCalendarEventInput = {
    title: input.title,
    scheduledAt: input.scheduledAt,
    durationMinutes: input.durationMinutes,
    timezone: input.timezone,
    description: input.description,
    meetingLink: input.meetingLink,
  };

  const googleCalendarUrl = buildGoogleCalendarUrl(event);
  const icsDownloadUrl = `${getAppBaseUrl()}/api/calendar/booking?token=${encodeURIComponent(input.token)}`;

  return {
    googleCalendarUrl,
    icsDownloadUrl,
    formattedDate: formatSlotDate(input.scheduledAt, input.timezone),
    formattedTime: formatSlotTime(input.scheduledAt, input.timezone),
  };
}
