import {
  enStandaloneAboutBody,
  enStandaloneAapBody,
  enStandaloneFaqBody,
} from "@/content/cms/en-standalone";
import { paragraphFieldToTiptapDocument } from "@/content/cms/tiptap-blocks";
import type { CmsParagraphField } from "@/content/cms/types";
import type { PublicContent } from "@/content/i18n/types";
import type { CmsLocale } from "@/lib/cms/definitions";
import { CMS_PAGE_DEFINITIONS, getCmsPageDefinition } from "@/lib/cms/definitions";
import type { CmsTiptapJson } from "@/lib/cms/types";
import {
  faqAnswerToTiptapDocument,
  plainStringToTiptapDocument,
  tiptapDocumentFromBlocks,
  tiptapHeadingNode,
  tiptapLinkParagraph,
  tiptapParagraphNode,
} from "@/lib/cms/import/tiptap-builders";

export type CmsImportContent = Pick<
  PublicContent,
  | "hero"
  | "trust"
  | "about"
  | "aap"
  | "faq"
  | "finalCta"
  | "seo"
  | "sectionLabels"
  | "site"
  | "footer"
>;

export type CmsImportFieldValue = {
  pageSlug: string;
  sectionKey: string;
  fieldKey: string;
  draftJson: CmsTiptapJson;
};

export const CMS_IMPORT_PAGE_SLUGS = ["home", "about", "aap", "faq", "contact", "legal"] as const;

export type CmsImportPageSlug = (typeof CMS_IMPORT_PAGE_SLUGS)[number];

function toParagraphFieldDocument(value: CmsParagraphField): CmsTiptapJson {
  return paragraphFieldToTiptapDocument(value);
}

function getHomeFieldValue(content: CmsImportContent, fieldKey: string): CmsTiptapJson | null {
  switch (fieldKey) {
    case "hero.headline":
      return plainStringToTiptapDocument(content.hero.headline);
    case "hero.explanation.0":
      return plainStringToTiptapDocument(content.hero.explanation[0] ?? "");
    case "hero.explanation.1":
      return plainStringToTiptapDocument(content.hero.explanation[1] ?? "");
    case "hero.explanation.2":
      return plainStringToTiptapDocument(content.hero.explanation[2] ?? "");
    case "hero.primaryCta.label":
      return plainStringToTiptapDocument(content.hero.primaryCta.label);
    case "hero.secondaryCta.label":
      return plainStringToTiptapDocument(content.hero.secondaryCta.label);
    case "trust.statements.0":
      return plainStringToTiptapDocument(content.trust.statements[0] ?? "");
    case "trust.statements.1":
      return plainStringToTiptapDocument(content.trust.statements[1] ?? "");
    case "trust.statements.2":
      return plainStringToTiptapDocument(content.trust.statements[2] ?? "");
    case "trust.statements.3":
      return plainStringToTiptapDocument(content.trust.statements[3] ?? "");
    case "about.title":
      return plainStringToTiptapDocument(content.about.title);
    case "about.story.0":
      return toParagraphFieldDocument(content.about.story[0] ?? "");
    case "about.story.1":
      return toParagraphFieldDocument(content.about.story[1] ?? "");
    case "about.story.2":
      return toParagraphFieldDocument(content.about.story[2] ?? "");
    case "aap.title":
      return plainStringToTiptapDocument(content.aap.title);
    case "aap.intro":
      return toParagraphFieldDocument(content.aap.intro);
    case "aap.points.0.title":
      return plainStringToTiptapDocument(content.aap.points[0]?.title ?? "");
    case "aap.points.0.description":
      return toParagraphFieldDocument(content.aap.points[0]?.description ?? "");
    case "aap.points.1.title":
      return plainStringToTiptapDocument(content.aap.points[1]?.title ?? "");
    case "aap.points.1.description":
      return toParagraphFieldDocument(content.aap.points[1]?.description ?? "");
    case "aap.points.2.title":
      return plainStringToTiptapDocument(content.aap.points[2]?.title ?? "");
    case "aap.points.2.description":
      return toParagraphFieldDocument(content.aap.points[2]?.description ?? "");
    case "aap.points.3.title":
      return plainStringToTiptapDocument(content.aap.points[3]?.title ?? "");
    case "aap.points.3.description":
      return toParagraphFieldDocument(content.aap.points[3]?.description ?? "");
    case "faq.headingLabel":
      return plainStringToTiptapDocument(content.faq.headingLabel);
    case "faq.heading":
      return plainStringToTiptapDocument(content.faq.heading);
    case "faq.items.0.question":
      return plainStringToTiptapDocument(content.faq.items[0]?.question ?? "");
    case "faq.items.0.answer":
      return faqAnswerToTiptapDocument(content.faq.items[0]?.answer ?? "");
    case "faq.items.1.question":
      return plainStringToTiptapDocument(content.faq.items[1]?.question ?? "");
    case "faq.items.1.answer":
      return faqAnswerToTiptapDocument(content.faq.items[1]?.answer ?? "");
    case "faq.items.2.question":
      return plainStringToTiptapDocument(content.faq.items[2]?.question ?? "");
    case "faq.items.2.answer":
      return faqAnswerToTiptapDocument(content.faq.items[2]?.answer ?? "");
    case "faq.items.3.question":
      return plainStringToTiptapDocument(content.faq.items[3]?.question ?? "");
    case "faq.items.3.answer":
      return faqAnswerToTiptapDocument(content.faq.items[3]?.answer ?? "");
    case "faq.items.4.question":
      return plainStringToTiptapDocument(content.faq.items[4]?.question ?? "");
    case "faq.items.4.answer":
      return faqAnswerToTiptapDocument(content.faq.items[4]?.answer ?? "");
    case "faq.items.5.question":
      return plainStringToTiptapDocument(content.faq.items[5]?.question ?? "");
    case "faq.items.5.answer":
      return faqAnswerToTiptapDocument(content.faq.items[5]?.answer ?? "");
    case "finalCta.lines.0":
      return plainStringToTiptapDocument(content.finalCta.lines[0] ?? "");
    case "finalCta.lines.1":
      return plainStringToTiptapDocument(content.finalCta.lines[1] ?? "");
    case "finalCta.lines.2":
      return plainStringToTiptapDocument(content.finalCta.lines[2] ?? "");
    case "finalCta.button.label":
      return plainStringToTiptapDocument(content.finalCta.button.label);
    case "seo.home.title":
      return plainStringToTiptapDocument(content.seo.home.title);
    case "seo.home.description":
      return plainStringToTiptapDocument(content.seo.home.description);
    default:
      return null;
  }
}

function buildAboutStandaloneBody(_content: CmsImportContent): CmsTiptapJson {
  return enStandaloneAboutBody;
}

function buildAapStandaloneBody(_content: CmsImportContent): CmsTiptapJson {
  return enStandaloneAapBody;
}

function buildFaqStandaloneBody(_content: CmsImportContent): CmsTiptapJson {
  return enStandaloneFaqBody;
}

function buildContactStandaloneBody(content: CmsImportContent): CmsTiptapJson {
  return tiptapDocumentFromBlocks([
    tiptapHeadingNode(1, content.sectionLabels.contactHeading),
    ...content.finalCta.lines.map((line) => tiptapParagraphNode(line)),
    tiptapLinkParagraph("Email: ", `mailto:${content.site.email}`, content.site.email),
    tiptapParagraphNode(content.finalCta.button.label),
  ]);
}

function buildLegalStandaloneBody(content: CmsImportContent): CmsTiptapJson {
  return tiptapDocumentFromBlocks([
    tiptapHeadingNode(1, "Legal"),
    tiptapParagraphNode(`${content.site.name}. ${content.footer.rights}`),
    tiptapLinkParagraph("Contact: ", `mailto:${content.site.email}`, content.site.email),
  ]);
}

function getStandaloneBodyValue(content: CmsImportContent, pageSlug: CmsImportPageSlug): CmsTiptapJson | null {
  switch (pageSlug) {
    case "about":
      return buildAboutStandaloneBody(content);
    case "aap":
      return buildAapStandaloneBody(content);
    case "faq":
      return buildFaqStandaloneBody(content);
    case "contact":
      return buildContactStandaloneBody(content);
    case "legal":
      return buildLegalStandaloneBody(content);
    default:
      return null;
  }
}

export function buildCmsImportFieldValues(
  content: CmsImportContent,
  pageSlug: CmsImportPageSlug,
): CmsImportFieldValue[] {
  const pageDefinition = getCmsPageDefinition(pageSlug);
  if (!pageDefinition) return [];

  const values: CmsImportFieldValue[] = [];

  for (const section of pageDefinition.sections) {
    for (const field of section.fields) {
      let draftJson: CmsTiptapJson | null = null;

      if (pageSlug === "home") {
        draftJson = getHomeFieldValue(content, field.key);
      } else if (field.key === "body") {
        draftJson = getStandaloneBodyValue(content, pageSlug);
      }

      if (!draftJson) continue;

      values.push({
        pageSlug,
        sectionKey: section.key,
        fieldKey: field.key,
        draftJson,
      });
    }
  }

  return values;
}

export function buildAllCmsImportFieldValues(
  content: CmsImportContent,
): CmsImportFieldValue[] {
  return CMS_IMPORT_PAGE_SLUGS.flatMap((pageSlug) => buildCmsImportFieldValues(content, pageSlug));
}

export function getCmsImportPageSlugs(): CmsImportPageSlug[] {
  return CMS_PAGE_DEFINITIONS.map((page) => page.slug).filter((slug): slug is CmsImportPageSlug =>
    CMS_IMPORT_PAGE_SLUGS.includes(slug as CmsImportPageSlug),
  );
}

export type LocaleContentLoader = (locale: CmsLocale) => Promise<CmsImportContent | null>;
