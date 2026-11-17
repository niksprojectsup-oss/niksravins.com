/**
 * Parsē Identitates_kartoteka (visas 10 tēmas, bilingvālu) .txt eksportu
 * strukturētā JSON, ko importē DB ar belief-library-import.ts.
 *
 * Lietošana:
 *   textutil -convert txt kartoteka.docx -output /tmp/kartoteka.txt
 *   npx tsx scripts/belief-library-parse.ts /tmp/kartoteka.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

type Branch = { sortOrder: number; textLv: string; textEn: string };
type Trunk = {
  libraryKey: string;
  sortOrder: number;
  titleLv: string;
  titleEn: string;
  negativeBelief: string;
  branches: Branch[];
};
type Theme = {
  libraryKey: string;
  sortOrder: number;
  titleLv: string;
  titleEn: string;
  descriptionLv: string;
  exploreQuestions: string;
  professionalNotes: string;
  trunks: Trunk[];
};

const srcPath = process.argv[2] ?? "/tmp/kartoteka10.txt";
const lines = readFileSync(srcPath, "utf-8")
  .split("\n")
  .map((l) => l.replace(/\r/g, "").trim());

const TRUNK_RE = /^(\d{1,2})\.(\d{1,2})\s{2,}(.+)$/;
const THEME_RE = /^(\d{2})\.\s+(.+)$/;
const NEG_RE = /^(?:IESPĒJAMAIS\s+)?NEGATĪVAIS UZSKATS\s*[|·]?\s*(.*)$/;
const BRANCH_RE = /^(\d+)\.\s+(.+)$/;

// ── Tēmu robežas ────────────────────────────────────────────────────
const themeIdx: { key: string; line: number }[] = [];
let indexStart = -1;
let boundariesStart = -1;
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (l.startsWith("Ātrās uzziņas")) indexStart = i;
  if (l.startsWith("Vispārīgas profesionālās")) boundariesStart = i;
  const m = THEME_RE.exec(l);
  if (m && indexStart === -1 && i > 15 && boundariesStart === -1) {
    // tēmas virsraksts: nākamā rinda ir EN nosaukums (ne cipars)
    const next = lines[i + 1] ?? "";
    if (next && !TRUNK_RE.test(next) && !/^[A-ZĀČĒĢĪĶĻŅŠŪŽ0-9]/.test("") ) {
      themeIdx.push({ key: m[1], line: i });
    }
  }
}
if (indexStart === -1) throw new Error("nav indeksa sadaļas");

const themes: Theme[] = [];

for (let t = 0; t < themeIdx.length; t++) {
  const start = themeIdx[t].line;
  const end = t + 1 < themeIdx.length ? themeIdx[t + 1].line : indexStart;
  const block = lines.slice(start, end);

  const themeM = THEME_RE.exec(block[0])!;
  const theme: Theme = {
    libraryKey: themeM[1],
    sortOrder: t,
    titleLv: themeM[2].trim(),
    titleEn: (block[1] ?? "").trim(),
    descriptionLv: "",
    exploreQuestions: "",
    professionalNotes: "",
    trunks: [],
  };

  const qIdx = block.findIndex((l) => l === "Izpētes jautājumi");
  const nIdx = block.findIndex((l) => l === "Profesionālās piezīmes");
  const sIdx = block.findIndex((l) => l.startsWith("SESIJAS PIEZĪMES"));

  if (qIdx !== -1 && nIdx !== -1) {
    theme.exploreQuestions = block.slice(qIdx + 1, nIdx).filter(Boolean).join("\n");
    theme.professionalNotes = block
      .slice(nIdx + 1, sIdx !== -1 ? sIdx : undefined)
      .filter(Boolean)
      .join(" ");
  }

  // virsraksts → pirmā stumbra: apraksts
  let cursor = 2;
  const descLines: string[] = [];
  while (cursor < block.length && !TRUNK_RE.test(block[cursor])) {
    if (block[cursor]) descLines.push(block[cursor]);
    cursor++;
  }
  theme.descriptionLv = descLines.join(" ");

  // stumbri
  while (cursor < (qIdx !== -1 ? qIdx : block.length)) {
    const tm = TRUNK_RE.exec(block[cursor]);
    if (!tm) { cursor++; continue; }

    const trunk: Trunk = {
      libraryKey: `${tm[1]}.${tm[2]}`,
      sortOrder: Number(tm[2]),
      titleLv: tm[3].trim(),
      titleEn: "",
      negativeBelief: "",
      branches: [],
    };
    cursor++;

    // NEGATĪVAIS UZSKATS rinda
    const negM = NEG_RE.exec(block[cursor] ?? "");
    if (negM) {
      trunk.negativeBelief = negM[1].trim() || (block[++cursor] ?? "").trim();
      cursor++;
    }

    // LV tituls (atkārtojas), tad EN tituls
    if (block[cursor] && !/^ZARI/.test(block[cursor])) {
      if (!trunk.titleLv || trunk.titleLv === block[cursor]) {
        // tituls jau no virsraksta; ja atšķiras, saglabā sīkāko (pilno) versiju
        if (block[cursor].length > trunk.titleLv.length) trunk.titleLv = block[cursor];
      }
      cursor++;
    }
    if (block[cursor] && !/^ZARI/.test(block[cursor])) {
      trunk.titleEn = block[cursor].trim();
      cursor++;
    }

    // ZARI sekcija
    if (/^ZARI/.test(block[cursor] ?? "")) cursor++;
    while (cursor < block.length) {
      const bm = BRANCH_RE.exec(block[cursor]);
      if (!bm || TRUNK_RE.test(block[cursor])) break;
      const lv = bm[2].trim();
      const en = (block[cursor + 1] ?? "").trim();
      trunk.branches.push({ sortOrder: Number(bm[1]), textLv: lv, textEn: en });
      cursor += 2;
    }
    theme.trunks.push(trunk);
  }

  themes.push(theme);
}

// ── Validācija ──────────────────────────────────────────────────────
const errors: string[] = [];
if (themes.length !== 10) errors.push(`tēmas: ${themes.length} (jābūt 10)`);
const trunkCount = themes.reduce((n, t) => n + t.trunks.length, 0);
if (trunkCount !== 41) errors.push(`stumbri: ${trunkCount} (jābūt 41)`);
for (const t of themes) {
  const expected = t.libraryKey === "10" ? 5 : 4;
  if (t.trunks.length !== expected)
    errors.push(`tēma ${t.libraryKey}: ${t.trunks.length} stumbri (jābūt ${expected})`);
  if (!t.exploreQuestions) errors.push(`tēma ${t.libraryKey}: nav izpētes jautājumu`);
  if (!t.professionalNotes) errors.push(`tēma ${t.libraryKey}: nav profesionālo piezīmju`);
  for (const tr of t.trunks) {
    if (!tr.titleLv || !tr.titleEn) errors.push(`${tr.libraryKey}: trūkst LV/EN titula`);
    if (!tr.negativeBelief) errors.push(`${tr.libraryKey}: nav negatīvā uzskata`);
    if (tr.branches.length !== 5) errors.push(`${tr.libraryKey}: ${tr.branches.length} zari (jābūt 5)`);
    for (const b of tr.branches) {
      if (!b.textLv || !b.textEn) errors.push(`${tr.libraryKey} zars ${b.sortOrder}: tukšs LV/EN`);
    }
  }
}
if (errors.length) {
  console.error("VALIDĀCIJAS KĻŪDAS:\n" + errors.join("\n"));
  process.exit(1);
}

const out = { themes, trunkCount };
writeFileSync("prisma/belief-library.json", JSON.stringify(out, null, 2) + "\n");
console.log(`OK: ${themes.length} tēmas, ${trunkCount} stumbri, ${themes.reduce((n, t) => n + t.trunks.reduce((m, tr) => m + tr.branches.length, 0), 0)} zari → prisma/belief-library.json`);
