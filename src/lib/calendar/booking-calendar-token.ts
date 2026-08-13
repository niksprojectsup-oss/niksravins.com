import { SignJWT, jwtVerify } from "jose";

export type BookingCalendarTokenPayload = {
  bookingId: string;
  scheduledAt: string;
  serviceTitle: string;
  durationMinutes: number;
  clientTimezone: string;
};

function getCalendarSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET must be at least 32 characters.");
    }
    return new TextEncoder().encode(
      "development-only-auth-secret-minimum-32-characters",
    );
  }
  return new TextEncoder().encode(secret);
}

const CALENDAR_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

export async function createBookingCalendarToken(
  payload: BookingCalendarTokenPayload,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.bookingId)
    .setIssuedAt()
    .setExpirationTime(`${CALENDAR_TOKEN_MAX_AGE_SECONDS}s`)
    .sign(getCalendarSecret());
}

export async function verifyBookingCalendarToken(
  token: string,
): Promise<BookingCalendarTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getCalendarSecret());
    const bookingId = payload.bookingId;
    const scheduledAt = payload.scheduledAt;
    const serviceTitle = payload.serviceTitle;
    const durationMinutes = payload.durationMinutes;
    const clientTimezone = payload.clientTimezone;

    if (
      typeof bookingId !== "string" ||
      typeof scheduledAt !== "string" ||
      typeof serviceTitle !== "string" ||
      typeof durationMinutes !== "number" ||
      typeof clientTimezone !== "string"
    ) {
      return null;
    }

    return {
      bookingId,
      scheduledAt,
      serviceTitle,
      durationMinutes,
      clientTimezone,
    };
  } catch {
    return null;
  }
}
