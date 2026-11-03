import { test } from "node:test";
import assert from "node:assert/strict";
import {
  LATVIAN_LOCALE,
  shouldBlockLatvianBooking,
  shouldShowBookingCta,
} from "./feature-flags";

test("LV + OFF -> blocked", () => {
  assert.equal(shouldBlockLatvianBooking(LATVIAN_LOCALE, false), true);
});

test("LV + ON -> allowed (default behavior preserved)", () => {
  assert.equal(shouldBlockLatvianBooking(LATVIAN_LOCALE, true), false);
});

test("EN unaffected when flag is OFF", () => {
  assert.equal(shouldBlockLatvianBooking("en", false), false);
});

test("EN unaffected when flag is ON", () => {
  assert.equal(shouldBlockLatvianBooking("en", true), false);
});

test("any other locale unaffected when flag is OFF", () => {
  for (const locale of ["ru", "de", "fr", "en-US"]) {
    assert.equal(shouldBlockLatvianBooking(locale, false), false);
  }
});

test("CTA visibility: LV + OFF -> header/hero/footer CTAs hidden", () => {
  assert.equal(shouldShowBookingCta(LATVIAN_LOCALE, false), false);
});

test("CTA visibility: LV + ON -> visible", () => {
  assert.equal(shouldShowBookingCta(LATVIAN_LOCALE, true), true);
});

test("CTA visibility: EN unaffected by OFF", () => {
  assert.equal(shouldShowBookingCta("en", false), true);
});

test("missing record fallback (enabled=true) keeps LV open", () => {
  // isLatvianBookingEnabled() returns true when the row is absent;
  // this test pins the decision function on that fallback value.
  assert.equal(shouldBlockLatvianBooking(LATVIAN_LOCALE, true), false);
});
