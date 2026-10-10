import type { PublicContent } from "@/content/i18n/types";
import type { EmphasizedRun } from "@/content/i18n/types";
import { getCmsPageDefinition } from "@/lib/cms/definitions";
import {
  faqAnswerToTiptapDocument,
  plainStringToTiptapDocument,
  plainStringsToTiptapDocument,
  tiptapDocumentFromBlocks,
  tiptapHeadingNode,
  tiptapLinkParagraph,
  tiptapParagraphNode,
  tiptapText,
} from "@/lib/cms/import/tiptap-builders";
import type { CmsTiptapJson } from "@/lib/cms/types";

function emphasizedDocument(parts: readonly EmphasizedRun[]): CmsTiptapJson {
  return tiptapDocumentFromBlocks([
    {
      type: "paragraph",
      attrs: { textAlign: null },
      content: parts.map((part) =>
        tiptapText(part.text, part.bold ? [{ type: "bold" }] : undefined),
      ),
    },
  ]);
}

function linesDocument(value: string): CmsTiptapJson {
  const lines = value.split("\n");
  const content: CmsTiptapJson[] = [];
  lines.forEach((line, index) => {
    if (index > 0) content.push({ type: "hardBreak" });
    if (line) content.push(tiptapText(line));
  });
  return tiptapDocumentFromBlocks([
    {
      type: "paragraph",
      attrs: { textAlign: null },
      content,
    },
  ]);
}

function paragraphFieldDocument(value: string | readonly string[]): CmsTiptapJson {
  return typeof value === "string"
    ? (value.includes("\n") ? linesDocument(value) : plainStringToTiptapDocument(value))
    : plainStringsToTiptapDocument(value);
}

export function buildDesignedLatvianHeroDocument(): CmsTiptapJson {
  return tiptapDocumentFromBlocks([
    tiptapParagraphNode("Jūs saprotat reakciju, bet tā tik un tā notiek"),
    tiptapHeadingNode(3, "Personiskā transformācija"),
    tiptapParagraphNode(
      "Darbs ar dziļākajām identitātes pārliecībām un emocionālajiem modeļiem, kas veido to, kā jūs piedzīvojat sevi un savu dzīvi.",
    ),
  ]);
}

export function buildLocaleLegalBody(content: PublicContent): CmsTiptapJson {
  return tiptapDocumentFromBlocks([
    tiptapHeadingNode(1, content.legal.heading.endsWith(".") ? content.legal.heading : `${content.legal.heading}.`),
    tiptapParagraphNode(content.legal.body),
    tiptapLinkParagraph(
      `${content.legal.contactLabel} `,
      `mailto:${content.site.email}`,
      content.site.email,
    ),
  ]);
}

export function buildLocaleHomeCmsFields(content: PublicContent): Record<string, CmsTiptapJson> {
  const definition = getCmsPageDefinition("home");
  if (!definition) return {};

  const fields: Record<string, CmsTiptapJson> = {};

  for (const section of definition.sections) {
    for (const field of section.fields) {
      if (field.kind === "image") continue;
      const document = homeFieldDocument(content, field.key);
      if (document) fields[field.key] = document;
    }
  }

  return fields;
}

function homeFieldDocument(content: PublicContent, fieldKey: string): CmsTiptapJson | null {
  if (fieldKey === "hero.headline" && content.locale === "lv") {
    return buildDesignedLatvianHeroDocument();
  }

  switch (fieldKey) {
    case "hero.headline":
      return plainStringToTiptapDocument(content.hero.headline);
    case "hero.primaryCta.label":
      return plainStringToTiptapDocument(content.hero.primaryCta.label);
    case "hero.secondaryCta.label":
      return plainStringToTiptapDocument(content.hero.secondaryCta.label);
    case "foundation.intro":
      return emphasizedDocument(content.foundation.intro);
    case "foundation.headline":
      return emphasizedDocument(content.foundation.headline);
    case "underneath.intro":
      return linesDocument(content.underneath.intro);
    case "underneath.headline":
      return linesDocument(content.underneath.headline);
    case "identityShifts.heading":
      return plainStringToTiptapDocument(content.identityShifts.heading);
    case "identityShifts.intro":
      return linesDocument(content.identityShifts.intro);
    case "identityShifts.closingLead":
      return plainStringToTiptapDocument(content.identityShifts.closingLead);
    case "identityShifts.closing":
      return linesDocument(content.identityShifts.closing);
    case "roots.intro":
      return linesDocument(content.roots.intro);
    case "roots.headline":
      return linesDocument(content.roots.headline);
    case "about.title":
      return plainStringToTiptapDocument(content.about.title);
    case "aap.title":
      return plainStringToTiptapDocument(content.aap.title);
    case "aap.intro":
      return paragraphFieldDocument(content.aap.intro);
    case "faq.headingLabel":
      return plainStringToTiptapDocument(content.faq.headingLabel);
    case "faq.heading":
      return plainStringToTiptapDocument(content.faq.heading);
    case "finalCta.button.label":
      return plainStringToTiptapDocument(content.finalCta.button.label);
    case "seo.home.title":
      return plainStringToTiptapDocument(content.seo.home.title);
    case "seo.home.description":
      return plainStringToTiptapDocument(content.seo.home.description);
    default:
      break;
  }

  const journey = /^journey\.change\.(\d+)$/.exec(fieldKey);
  if (journey) {
    const step = content.journey.steps[Number(journey[1])];
    return step ? emphasizedDocument(step) : null;
  }

  const alignment = /^alignment\.(\d+)\.(title|body)$/.exec(fieldKey);
  if (alignment) {
    const item = content.alignment.items[Number(alignment[1])];
    if (!item) return null;
    return plainStringToTiptapDocument(alignment[2] === "title" ? item.title : item.body);
  }

  const identity = /^identityShifts\.rows\.(\d+)\.(from|explanation|to)$/.exec(fieldKey);
  if (identity) {
    const row = content.identityShifts.rows[Number(identity[1])];
    if (!row) return null;
    return identity[2] === "explanation"
      ? linesDocument(row.explanation)
      : plainStringToTiptapDocument(row[identity[2] as "from" | "to"]);
  }

  const trust = /^trust\.statements\.(\d+)$/.exec(fieldKey);
  if (trust) {
    const statement = content.trust.statements[Number(trust[1])];
    return statement ? paragraphFieldDocument(statement) : null;
  }

  const about = /^about\.story\.(\d+)$/.exec(fieldKey);
  if (about) {
    const story = content.about.story[Number(about[1])];
    return story ? paragraphFieldDocument(story) : null;
  }

  const aapPoint = /^aap\.points\.(\d+)\.(title|description)$/.exec(fieldKey);
  if (aapPoint) {
    const point = content.aap.points[Number(aapPoint[1])];
    if (!point) return null;
    return aapPoint[2] === "title"
      ? plainStringToTiptapDocument(point.title)
      : paragraphFieldDocument(point.description);
  }

  const faqQuestion = /^faq\.items\.(\d+)\.question$/.exec(fieldKey);
  if (faqQuestion) {
    const item = content.faq.items[Number(faqQuestion[1])];
    return item ? plainStringToTiptapDocument(item.question) : null;
  }

  const faqAnswer = /^faq\.items\.(\d+)\.answer$/.exec(fieldKey);
  if (faqAnswer) {
    const item = content.faq.items[Number(faqAnswer[1])];
    return item ? faqAnswerToTiptapDocument(item.answer) : null;
  }

  const finalLine = /^finalCta\.lines\.(\d+)$/.exec(fieldKey);
  if (finalLine) {
    const line = content.finalCta.lines[Number(finalLine[1])];
    return line ? plainStringToTiptapDocument(line) : null;
  }

  return null;
}
