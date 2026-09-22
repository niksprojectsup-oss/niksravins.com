import { readFileSync, existsSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { tiptapJsonToPlainText } from "../src/lib/cms/tiptap";
import type { CmsTiptapJson } from "../src/lib/cms/types";

const NEW_COPY_MARKERS = {
  homeHeadline: "You understand the reaction. It still happens.",
  homeOldPublished: "cms home test",
  aboutBody: "I work with people who already understand a lot about themselves",
  aboutOldPublished: "cmr test",
  aapBody: "AAP is the structured therapeutic process I use within psychotherapy.",
  faqBody: "What is Identity Re-coding?",
} as const;

function loadEnvFiles(): void {
  for (const file of [".env", ".env.local"]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const match = line.match(/^(DATABASE_URL|DIRECT_URL|NEXT_PUBLIC_APP_URL)\s*=\s*(.*)$/);
      if (!match) continue;
      process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

function safeDatabaseIdentifier(): string {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) return "(DATABASE_URL not set)";

  try {
    const url = new URL(raw);
    const database = url.pathname.replace(/^\//, "") || "(default)";
    const sslmode = url.searchParams.get("sslmode");
    return `${url.hostname}/${database}${sslmode ? ` (sslmode=${sslmode})` : ""}`;
  } catch {
    return "(DATABASE_URL unparseable)";
  }
}

function containsMarker(text: string, marker: string): boolean {
  return text.toLowerCase().includes(marker.toLowerCase());
}

function summarizeField(
  label: string,
  draftText: string,
  publishedText: string,
  newMarker: string,
  oldMarker?: string,
): void {
  const draftHasNew = containsMarker(draftText, newMarker);
  const publishedHasNew = containsMarker(publishedText, newMarker);
  const publishedHasOld = oldMarker ? containsMarker(publishedText, oldMarker) : false;

  console.log(`${label}:`);
  console.log(`  draft contains new copy = ${draftHasNew ? "yes" : "no"}`);
  console.log(`  published contains new copy = ${publishedHasNew ? "yes" : "no"}`);
  if (oldMarker) {
    console.log(`  published contains old test copy = ${publishedHasOld ? "yes" : "no"}`);
  }
  console.log(`  draft preview = ${draftText.slice(0, 100).replace(/\s+/g, " ") || "(empty)"}`);
  console.log(
    `  published preview = ${publishedText.slice(0, 100).replace(/\s+/g, " ") || "(empty)"}`,
  );
}

async function main(): Promise<void> {
  loadEnvFiles();

  console.log("CMS PRODUCTION DIAGNOSTIC");
  console.log("=========================");
  console.log("");
  console.log(`Database: ${safeDatabaseIdentifier()}`);
  console.log(`App URL (local env): ${process.env.NEXT_PUBLIC_APP_URL ?? "(not set)"}`);
  console.log("");

  const prisma = new PrismaClient();

  try {
    await prisma.$queryRaw`SELECT 1`;

    const pages = ["home", "about", "aap", "faq"] as const;

    for (const slug of pages) {
      const page = await prisma.cmsPage.findUnique({
        where: { slug },
        include: {
          sections: {
            include: {
              items: {
                where: { locale: "en" },
              },
            },
          },
        },
      });

      console.log(`${slug}:`);
      if (!page) {
        console.log("  status = (page not found)");
        console.log("");
        continue;
      }

      console.log(`  status = ${page.status}`);
      console.log(`  updatedAt = ${page.updatedAt.toISOString()}`);

      const fieldKey = slug === "home" ? "hero.headline" : "body";
      const item = page.sections
        .flatMap((section) => section.items)
        .find((entry) => entry.fieldKey === fieldKey);

      if (!item) {
        console.log(`  field ${fieldKey} = (not found)`);
        console.log("");
        continue;
      }

      const draftText = tiptapJsonToPlainText(item.draftJson as CmsTiptapJson | null);
      const publishedText = tiptapJsonToPlainText(item.publishedJson as CmsTiptapJson | null);

      if (slug === "home") {
        summarizeField(
          "  hero.headline",
          draftText,
          publishedText,
          NEW_COPY_MARKERS.homeHeadline,
          NEW_COPY_MARKERS.homeOldPublished,
        );
      } else if (slug === "about") {
        summarizeField(
          "  body",
          draftText,
          publishedText,
          NEW_COPY_MARKERS.aboutBody,
          NEW_COPY_MARKERS.aboutOldPublished,
        );
      } else if (slug === "aap") {
        summarizeField("  body", draftText, publishedText, NEW_COPY_MARKERS.aapBody);
      } else {
        summarizeField("  body", draftText, publishedText, NEW_COPY_MARKERS.faqBody);
      }

      console.log("");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
