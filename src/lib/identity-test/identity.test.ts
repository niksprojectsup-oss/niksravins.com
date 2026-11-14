import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { clusterBeliefs, composePortraits } from "./compose.ts";
import { validateSubmitPayload } from "./validate.ts";
import { createUnsubscribeToken, verifyUnsubscribeToken } from "./tokens.ts";
import { normalizeEmail, emailHash } from "./hash.ts";
import type { ConnectorTexts, ResolvedBeliefContent } from "./types.ts";

process.env.AUTH_SECRET ??= "test-secret-for-unit-tests";

const connectors: ConnectorTexts = {
  opening: "Sākums.",
  joinSimilar: "Tie dalās kopējā mehānismā:",
  joinContrast: "Savukārt",
  transition: "Iedomājies nākotni.",
  closing: "Beigas.",
  closingFuture: "Cerību beigas.",
};

const belief = (over: Partial<ResolvedBeliefContent>): ResolvedBeliefContent => ({
  id: "b1",
  stableKey: "T01-S01-B01",
  negativeBelief: "Es neesmu pietiekami labs",
  portraitNow: "Tu baidies mēģināt.",
  portraitFuture: "Tu mēģini brīvi.",
  trunk: "",
  branches: [],
  mechanismKeys: ["self-worth"],
  safetyFlags: [],
  themeId: "t1",
  themeSlug: "tema",
  themeName: "Tēma",
  subcategoryName: "Apakštēma",
  resolvedLocale: "lv",
  ...over,
});

describe("composePortraits", () => {
  it("veido divus portretus no fragmentiem", () => {
    const { portraitNow, portraitFuture, safetyTriggered } = composePortraits({
      beliefs: [belief({})],
      connectors,
    });
    assert.equal(safetyTriggered, false);
    assert.ok(portraitNow.includes("Sākums."));
    assert.ok(portraitNow.includes("Tu baidies mēģināt."));
    assert.ok(portraitNow.includes("Beigas."));
    assert.ok(portraitFuture.includes("Iedomājies nākotni."));
    assert.ok(portraitFuture.includes("Tu mēģini brīvi."));
  });

  it("grupē uzskatus ar kopīgu mehānismu vienā klasterī", () => {
    const clusters = clusterBeliefs([
      belief({ id: "a", mechanismKeys: ["x"] }),
      belief({ id: "b", mechanismKeys: ["x"] }),
      belief({ id: "c", mechanismKeys: ["y"] }),
    ]);
    assert.equal(clusters.length, 2);
    const sizes = clusters.map((c) => c.beliefs.length).sort();
    assert.deepEqual(sizes, [1, 2]);
  });

  it("klasteris ar >1 uzskatu iekļauj joinSimilar frāzi", () => {
    const { portraitNow } = composePortraits({
      beliefs: [
        belief({ id: "a", mechanismKeys: ["x"], portraitNow: "Pirmais." }),
        belief({ id: "b", mechanismKeys: ["x"], portraitNow: "Otrais." }),
      ],
      connectors,
    });
    assert.ok(portraitNow.includes("Tie dalās kopējā mehānismā:"));
    assert.ok(portraitNow.includes("Pirmais."));
    assert.ok(portraitNow.includes("Otrais."));
  });

  it("dažādi mehānismi → kontrasta savienotājs starp klasteriem", () => {
    const { portraitNow } = composePortraits({
      beliefs: [
        belief({ id: "a", mechanismKeys: ["x"], portraitNow: "AAA." }),
        belief({ id: "b", mechanismKeys: ["y"], portraitNow: "BBB." }),
      ],
      connectors,
    });
    assert.ok(portraitNow.includes("Savukārt"));
  });

  it("joinSimilar neligzdojas aiz kontrasta savienotāja", () => {
    const { portraitNow } = composePortraits({
      beliefs: [
        belief({ id: "a", mechanismKeys: ["x"], portraitNow: "A1." }),
        belief({ id: "b", mechanismKeys: ["x"], portraitNow: "A2." }),
        belief({ id: "c", mechanismKeys: ["y"], portraitNow: "B1." }),
        belief({ id: "d", mechanismKeys: ["y"], portraitNow: "B2." }),
      ],
      connectors,
    });
    assert.equal(portraitNow.match(/Tie dalās kopējā mehānismā:/g)?.length, 1);
    assert.ok(!portraitNow.includes("Savukārt Tie dalās"));
  });

  it("deduplikē identiskus fragmentus", () => {
    const { portraitNow } = composePortraits({
      beliefs: [
        belief({ id: "a", mechanismKeys: ["x"], portraitNow: "Vienāds teksts." }),
        belief({ id: "b", mechanismKeys: ["x"], portraitNow: " vienāds   teksts. " }),
      ],
      connectors,
    });
    assert.equal(portraitNow.match(/Vienāds teksts\./g)?.length, 1);
  });

  it("CRISIS karogs pievieno drošības bloku un atgriež safetyTriggered", () => {
    const { portraitNow, safetyTriggered } = composePortraits({
      beliefs: [belief({ safetyFlags: ["CRISIS"] })],
      connectors,
      safetyBlock: "Zvani 112 vai 113.",
    });
    assert.equal(safetyTriggered, true);
    assert.ok(portraitNow.includes("Zvani 112 vai 113."));
  });
});

describe("validateSubmitPayload", () => {
  const base = {
    requestId: "123e4567-e89b-42d3-a456-426614174000",
    email: "test@example.com",
    locale: "lv",
    beliefIds: ["b1", "b2"],
    allowedLocales: ["lv", "en"] as const,
  };
  it("pieņem derīgu payload", () => {
    assert.deepEqual(validateSubmitPayload(base), { ok: true });
  });
  it("noraida nederīgu e-pastu", () => {
    const r = validateSubmitPayload({ ...base, email: "nav-epasts" });
    assert.equal(r.ok, false);
  });
  it("noraida dublētus uzskatus", () => {
    const r = validateSubmitPayload({ ...base, beliefIds: ["a", "a"] });
    assert.equal(r.ok, false);
  });
  it("noraida neatļautu valodu", () => {
    const r = validateSubmitPayload({ ...base, locale: "de" });
    assert.equal(r.ok, false);
  });
  it("noraida tukšu izvēli", () => {
    const r = validateSubmitPayload({ ...base, beliefIds: [] });
    assert.equal(r.ok, false);
  });
});

describe("unsubscribe tokens", () => {
  it("verificē pareizu tokenu", () => {
    const token = createUnsubscribeToken("consent-123");
    assert.equal(verifyUnsubscribeToken(token), "consent-123");
  });
  it("noraida viljotu tokenu", () => {
    const token = createUnsubscribeToken("consent-123");
    const tampered = `${token.slice(0, -4)}xxxx`;
    assert.equal(verifyUnsubscribeToken(tampered), null);
    assert.equal(verifyUnsubscribeToken("a.b.c"), null);
    assert.equal(verifyUnsubscribeToken(""), null);
  });
});

describe("email hash/normalize", () => {
  it("normalizē un veido stabilu hash", () => {
    assert.equal(normalizeEmail("  TeSt@Example.COM "), "test@example.com");
    assert.equal(emailHash("a@b.com"), emailHash("A@B.COM"));
    assert.notEqual(emailHash("a@b.com"), emailHash("x@b.com"));
  });
});
