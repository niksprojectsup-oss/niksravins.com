import { BUSINESS_TIMEZONE } from "@/lib/booking/timezone";

const KNOWN_SERVICE_IDS = [
  "initial-aap-session",
  "aap-transformation-package",
] as const;

export type KnownServiceId = (typeof KNOWN_SERVICE_IDS)[number];

export function isKnownServiceId(value: string): value is KnownServiceId {
  return KNOWN_SERVICE_IDS.includes(value as KnownServiceId);
}

export function resolveServiceId(value: string): KnownServiceId | null {
  const normalized = value.trim();
  return isKnownServiceId(normalized) ? normalized : null;
}

export function resolveDisplayTimezone(timezone: string | undefined | null): string {
  const candidate = timezone?.trim();
  if (!candidate) return BUSINESS_TIMEZONE;

  try {
    Intl.DateTimeFormat(undefined, { timeZone: candidate });
    return candidate;
  } catch {
    return BUSINESS_TIMEZONE;
  }
}

export function logAvailabilityError(
  context: string,
  error: unknown,
  meta: Record<string, string | number | boolean | null | undefined>,
): void {
  const payload: Record<string, unknown> = {
    ...meta,
    context,
  };

  if (error instanceof Error) {
    payload.errorName = error.name;
    payload.errorMessage = error.message;
  } else {
    payload.errorMessage = String(error);
  }

  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  ) {
    payload.prismaCode = (error as { code: string }).code;
  }

  console.error("[booking-availability]", payload);
}
