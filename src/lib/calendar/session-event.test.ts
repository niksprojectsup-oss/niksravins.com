import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildGoogleCalendarUrl,
  buildIcsContent,
  buildSessionCalendarDescription,
} from "./session-event.ts";

describe("session calendar", () => {
  const sample = {
    title: "45-minute Initial Session",
    scheduledAt: "2026-09-15T10:00:00.000Z",
    durationMinutes: 45,
    timezone: "Europe/Riga",
    meetingLink: "https://meet.example.com/abc",
    description: "Online session with Niks Ravins.",
  };

  it("builds a Google Calendar URL with encoded event data", () => {
    const url = buildGoogleCalendarUrl(sample);
    assert.match(url, /^https:\/\/calendar\.google\.com\/calendar\/render\?/);
    assert.match(url, /action=TEMPLATE/);
    assert.match(url, /text=45-minute\+Initial\+Session/);
    assert.match(url, /dates=20260915T100000Z%2F20260915T104500Z/);
    assert.match(url, /ctz=Europe%2FRiga/);
    assert.match(url, /location=https%3A%2F%2Fmeet\.example\.com%2Fabc/);
  });

  it("builds standards-compliant ICS content", () => {
    const ics = buildIcsContent(sample);
    assert.match(ics, /^BEGIN:VCALENDAR/);
    assert.match(ics, /BEGIN:VEVENT/);
    assert.match(ics, /SUMMARY:45-minute Initial Session/);
    assert.match(ics, /DTSTART:20260915T100000Z/);
    assert.match(ics, /DTEND:20260915T104500Z/);
    assert.match(ics, /END:VEVENT/);
    assert.match(ics, /END:VCALENDAR/);
  });

  it("includes meeting link in description", () => {
    const description = buildSessionCalendarDescription(sample);
    assert.match(description, /Meeting link: https:\/\/meet\.example\.com\/abc/);
  });
});
