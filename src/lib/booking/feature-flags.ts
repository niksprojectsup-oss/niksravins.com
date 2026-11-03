import { prisma } from "@/lib/db/prisma";

export const LATVIAN_LOCALE = "lv";

/**
 * Pure decision: only the Latvian booking flow is gated.
 * Any other locale (en, etc.) is always allowed regardless of the flag.
 */
export function shouldBlockLatvianBooking(
  locale: string,
  latvianBookingEnabled: boolean,
): boolean {
  return locale === LATVIAN_LOCALE && !latvianBookingEnabled;
}

/** Whether booking CTAs/links should be visible for the given locale. */
export function shouldShowBookingCta(
  locale: string,
  latvianBookingEnabled: boolean,
): boolean {
  return !shouldBlockLatvianBooking(locale, latvianBookingEnabled);
}

/**
 * Reads the flag from BookingSettings. Missing record -> defaults to ON.
 * Pre-migration (P2021/P2022) -> ON. Unexpected errors are logged, then ON.
 */
export async function isLatvianBookingEnabled(): Promise<boolean> {
  try {
    const row = await prisma.bookingSettings.findUnique({
      where: { id: "default" },
      select: { latvianBookingEnabled: true },
    });
    return row?.latvianBookingEnabled ?? true;
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? (error as { code: string }).code
        : undefined;
    if (code === "P2021" || code === "P2022") {
      return true; // settings table/column not migrated yet
    }
    console.error("[feature-flags] failed to read latvianBookingEnabled", error);
    return true;
  }
}
