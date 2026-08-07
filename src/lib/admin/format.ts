import { BUSINESS_TIMEZONE, formatInTimeZone } from "@/lib/booking/timezone";

export function formatAdminDate(iso: string): string {
  return formatInTimeZone(iso, BUSINESS_TIMEZONE, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatAdminDateTime(iso: string): string {
  return formatInTimeZone(iso, BUSINESS_TIMEZONE, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function formatAdminDateTimeWithClient(
  iso: string,
  clientTimezone?: string | null,
): string {
  const riga = formatAdminDateTime(iso);
  if (!clientTimezone || clientTimezone === BUSINESS_TIMEZONE) {
    return riga;
  }

  const clientTime = formatInTimeZone(iso, clientTimezone, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return `${riga} · Client: ${clientTime}`;
}

export function formatCurrency(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(cents / 100);
}
