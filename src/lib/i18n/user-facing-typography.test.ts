import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

// Typographie policy: user-facing text must use the plain hyphen "-".
// The em dash and en dash are never allowed in user-visible site text.
const EM_DASH = "—";
const EN_DASH = "–";

const ROOT = process.cwd();
const SCANNED_DIRS = [
  "src/app",
  "src/components",
  "src/content",
  "src/lib",
  "scripts",
];
const SCANNED_PRISMA_FILES = [
  "prisma/identity-beliefs-en.jsonl",
  "prisma/identity-meta-en.json",
  "prisma/identity-portraits-en.jsonl",
  "prisma/identity-portraits-lv.jsonl",
  "prisma/identity-test-content.json",
];
const EXTENSIONS = new Set([".ts", ".tsx", ".json", ".jsonl"]);
// This test file is exempt from scanning itself.
const SELF = relative(ROOT, __filename);

function collect(dir: string, out: string[] = []): string[] {
  let entries: string[] = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (name !== "node_modules") collect(p, out);
    } else if (EXTENSIONS.has(p.slice(p.lastIndexOf(".")))) {
      out.push(p);
    }
  }
  return out;
}

describe("user-facing typography", () => {
  it("no em dash or en dash in user-visible text sources", () => {
    const files: string[] = [];
    for (const dir of SCANNED_DIRS) collect(join(ROOT, dir), files);
    files.push(...SCANNED_PRISMA_FILES.map((f) => join(ROOT, f)));

    const violations: string[] = [];
    for (const file of files) {
      const rel = relative(ROOT, file);
      if (rel === SELF) continue;
      const text = readFileSync(file, "utf-8");
      const lines = text.split("\n");
      for (let i = 0; i < lines.length; i += 1) {
        if (lines[i].includes(EM_DASH) || lines[i].includes(EN_DASH)) {
          violations.push(`${rel}:${i + 1}`);
        }
      }
    }
    assert.deepEqual(violations, [], "Forbidden dash characters found in user-facing sources");
  });
});
