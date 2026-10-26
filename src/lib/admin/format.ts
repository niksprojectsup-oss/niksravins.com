import { BUSINESS_TIMEZONE, formatInTimeZone } from "@/lib/booking/timezone";

export function formatAdminDate(iso: string): string {
  return formatInTimeZone(iso, BUSINESS_TIMEZONE, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const ADMIN_DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZoneName: "short",
};

/**
 * `Intl.DateTimeFormat#format` joins the date and time with a locale literal.
 * Node's en-GB data uses a comma ("10 Aug, 15:51 EEST"); browser ICU may use
 * "at" ("10 Aug at 15:51 EEST"). Field values stay stable, so build the string
 * from those parts instead of the engine-specific glue.
 */
function formatAdminZonedDateTime(iso: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    ...ADMIN_DATE_TIME_OPTIONS,
    timeZone,
  }).formatToParts(new Date(iso));
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${value("day")} ${value("month")}, ${value("hour")}:${value("minute")} ${value("timeZoneName")}`;
}

export function formatAdminDateTime(iso: string): string {
  return formatAdminZonedDateTime(iso, BUSINESS_TIMEZONE);
}

export function formatAdminDateTimeWithClient(
  iso: string,
  clientTimezone?: string | null,
): string {
  const riga = formatAdminDateTime(iso);
  if (!clientTimezone || clientTimezone === BUSINESS_TIMEZONE) {
    return riga;
  }

  const clientTime = formatAdminZonedDateTime(iso, clientTimezone);

  return `${riga} · Client: ${clientTime}`;
}

export function formatCurrency(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(cents / 100);
}
