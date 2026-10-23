import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { formatAdminDateTime, formatAdminDateTimeWithClient } from "./format.ts";

const SUMMER = "2026-08-10T12:51:00.000Z";

describe("formatAdminDateTime", () => {
  const OriginalDateTimeFormat = Intl.DateTimeFormat;

  afterEach(() => {
    Intl.DateTimeFormat = OriginalDateTimeFormat;
  });

  it("formats Europe/Riga with a stable comma between date and time", () => {
    assert.equal(formatAdminDateTime(SUMMER), "10 Aug, 15:51 EEST");
    assert.equal(formatAdminDateTime("2026-08-10T06:05:00.000Z"), "10 Aug, 09:05 EEST");
    assert.equal(formatAdminDateTime("2026-01-10T12:51:00.000Z"), "10 Jan, 14:51 EET");
  });

  it("ignores ICU date-time glue that differs between server and browser", () => {
    class BrowserDateTimeFormat extends OriginalDateTimeFormat {
      format(): string {
        return "10 Aug at 15:51 EEST";
      }

      formatToParts(date?: Date | number): Intl.DateTimeFormatPart[] {
        return super.formatToParts(date).map((part) =>
          part.type === "literal" && part.value.includes(",")
            ? { ...part, value: " at " }
            : part,
        );
      }
    }

    Intl.DateTimeFormat = BrowserDateTimeFormat as typeof Intl.DateTimeFormat;

    assert.equal(formatAdminDateTime(SUMMER), "10 Aug, 15:51 EEST");
    assert.equal(
      formatAdminDateTimeWithClient(SUMMER, "America/New_York"),
      "10 Aug, 15:51 EEST · Client: 10 Aug, 08:51 GMT-4",
    );
  });
});
