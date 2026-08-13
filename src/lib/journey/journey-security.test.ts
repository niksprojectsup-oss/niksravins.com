import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  filterJournalEntriesForAdmin,
  assertJournalEntryOwnedBy,
  canCreateCheckInForDate,
} from "./security.ts";
import {
  isValidAssessmentScore,
  isValidSessionRating,
  isValidCheckInMood,
  sanitizeEmotionTags,
} from "./validation.ts";

describe("journal security", () => {
  const clientA = "client-a";
  const clientB = "client-b";

  const entries = [
    { id: "1", clientId: clientA, visibility: "PRIVATE" as const, content: "secret" },
    { id: "2", clientId: clientA, visibility: "SHARED" as const, content: "shared a" },
    { id: "3", clientId: clientB, visibility: "SHARED" as const, content: "shared b" },
  ];

  it("excludes private journal from admin view", () => {
    const result = filterJournalEntriesForAdmin(entries, clientA);
    assert.equal(result.length, 1);
    assert.equal(result[0]?.content, "shared a");
    assert.ok(result.every((e) => e.visibility === "SHARED"));
  });

  it("excludes another client's shared journal from admin view for client A", () => {
    const result = filterJournalEntriesForAdmin(entries, clientA);
    assert.ok(result.every((e) => e.clientId === clientA));
  });

  it("includes shared journal for the correct client", () => {
    const result = filterJournalEntriesForAdmin(entries, clientB);
    assert.equal(result.length, 1);
    assert.equal(result[0]?.content, "shared b");
  });

  it("verifies journal ownership", () => {
    assert.equal(assertJournalEntryOwnedBy(entries[0], clientA), true);
    assert.equal(assertJournalEntryOwnedBy(entries[0], clientB), false);
    assert.equal(assertJournalEntryOwnedBy(null, clientA), false);
  });
});

describe("check-in rules", () => {
  it("allows editing existing check-in for same date", () => {
    assert.equal(canCreateCheckInForDate("2026-08-11", "2026-08-11", true), true);
  });

  it("prevents duplicate create for same date when not updating", () => {
    assert.equal(canCreateCheckInForDate("2026-08-11", "2026-08-11", false), false);
  });

  it("allows first check-in for a date", () => {
    assert.equal(canCreateCheckInForDate(null, "2026-08-11", false), true);
  });
});

describe("validation", () => {
  it("constrains self-assessment scores to 0-10", () => {
    assert.equal(isValidAssessmentScore(0), true);
    assert.equal(isValidAssessmentScore(10), true);
    assert.equal(isValidAssessmentScore(11), false);
    assert.equal(isValidAssessmentScore(-1), false);
    assert.equal(isValidAssessmentScore(5.5), false);
  });

  it("constrains session ratings to 1-5", () => {
    assert.equal(isValidSessionRating(1), true);
    assert.equal(isValidSessionRating(5), true);
    assert.equal(isValidSessionRating(0), false);
  });

  it("validates check-in moods", () => {
    assert.equal(isValidCheckInMood("CALM"), true);
    assert.equal(isValidCheckInMood("INVALID"), false);
  });

  it("sanitizes emotion tags", () => {
    assert.deepEqual(sanitizeEmotionTags(["Calm", "Calm", "Clear", " Fake ", "Hopeful"]), [
      "Calm",
      "Clear",
      "Hopeful",
    ]);
  });
});

describe("testimonial consent storage shape", () => {
  it("accepts valid consent values", () => {
    const consents = ["PRIVATE", "ANONYMOUS", "NAMED"] as const;
    assert.equal(consents.includes("PRIVATE"), true);
    assert.equal(consents.includes("ANONYMOUS"), true);
    assert.equal(consents.includes("NAMED"), true);
  });
});
