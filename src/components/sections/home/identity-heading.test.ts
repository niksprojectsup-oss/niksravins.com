import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const globalsCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../../../app/globals.css"),
  "utf8",
);

function ruleBody(selector: string) {
  const pattern = new RegExp(`${selector.replace(".", "\\.")}\\s*\\{([^}]*)\\}`);
  const match = globalsCss.match(pattern);
  assert.ok(match, `missing ${selector}`);
  return match[1] ?? "";
}

describe("identity shifts heading width", () => {
  it("does not force a one-line CMS heading onto two lines with a 16ch cap", () => {
    const heading = ruleBody(".home-identity-heading");
    const intro = ruleBody(".home-identity-intro");
    assert.doesNotMatch(heading, /max-width:\s*16ch/);
    assert.doesNotMatch(heading, /white-space:\s*nowrap/);
    assert.match(heading, /max-width:\s*100%/);
    assert.doesNotMatch(intro, /max-width:\s*46rem/);
    assert.match(intro, /max-width:\s*100%/);
  });

  it("keeps the identity lede and closing copy on the section measure", () => {
    assert.match(globalsCss, /\.home-identity-lede\s*\{[^}]*max-width:\s*46rem/);
    assert.match(globalsCss, /\.home-identity-close\s*\{[^}]*max-width:\s*46rem/);
  });

  it("leaves the FAQ title's own 16ch measure unchanged", () => {
    assert.match(ruleBody(".type-home-title"), /max-width:\s*16ch/);
  });

  it("keeps a short desktop gap under the identity closing text", () => {
    assert.match(
      globalsCss,
      /@media \(min-width: 800px\)\s*\{\s*\.home-identity\s*\{\s*padding-bottom:\s*2rem;/,
    );
    assert.match(
      globalsCss,
      /@media \(max-width: 799px\)\s*\{\s*\.home-identity\s*\{\s*padding-block:\s*clamp\(3\.25rem, 10vw, 4\.5rem\)/,
    );
    assert.match(globalsCss, /\.home-identity-close-lead\s*\{\s*margin:\s*0 auto 0\.9rem;/);
    assert.match(globalsCss, /\.home-identity-close-copy-text p\s*\{[^}]*margin:\s*0;/);
  });
});
