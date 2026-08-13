import { NextResponse } from "next/server";
import { verifyBookingCalendarToken } from "@/lib/calendar/booking-calendar-token";
import { buildIcsContent } from "@/lib/calendar/session-event";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing calendar token." }, { status: 400 });
  }

  const payload = await verifyBookingCalendarToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired calendar link." }, { status: 403 });
  }

  const meetingLink = process.env.SESSION_MEETING_URL?.trim() || null;
  const ics = buildIcsContent({
    title: payload.serviceTitle,
    scheduledAt: payload.scheduledAt,
    durationMinutes: payload.durationMinutes,
    timezone: payload.clientTimezone,
    meetingLink,
    description: "Online session with Niks Ravins.",
  });

  const filename = `session-${payload.bookingId}.ics`;

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
