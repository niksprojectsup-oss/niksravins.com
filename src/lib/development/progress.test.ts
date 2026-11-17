import test from "node:test";
import assert from "node:assert/strict";
import { computeDevelopmentProgress } from "./progress";

test("progress: tukšs darba plāns - 0%, nevis kļūdains procents", () => {
  const p = computeDevelopmentProgress({ totalTrunks: 0, completedTrunks: 0, inProgressTrunks: 0 });
  assert.equal(p.percent, 0);
  assert.equal(p.remainingTrunks, 0);
});

test("progress: 6 no 10 stumbriem = 60%", () => {
  const p = computeDevelopmentProgress({ totalTrunks: 10, completedTrunks: 6, inProgressTrunks: 2 });
  assert.equal(p.percent, 60);
  assert.equal(p.remainingTrunks, 4);
});

test("progress: visi pabeigti = 100%", () => {
  const p = computeDevelopmentProgress({ totalTrunks: 4, completedTrunks: 4, inProgressTrunks: 0 });
  assert.equal(p.percent, 100);
  assert.equal(p.remainingTrunks, 0);
});

test("progress: jauns stumbrs pazemina procentu un palielina atlikušos", () => {
  const before = computeDevelopmentProgress({ totalTrunks: 5, completedTrunks: 5, inProgressTrunks: 0 });
  assert.equal(before.percent, 100);
  const after = computeDevelopmentProgress({ totalTrunks: 6, completedTrunks: 5, inProgressTrunks: 0 });
  assert.equal(after.percent, 83);
  assert.equal(after.remainingTrunks, 1);
});

test("progress: nepabeigts stumbrs nepieskaitās pabeigtajiem", () => {
  const p = computeDevelopmentProgress({ totalTrunks: 3, completedTrunks: 1, inProgressTrunks: 2 });
  assert.equal(p.percent, 33);
});
