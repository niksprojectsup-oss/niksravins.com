import type { CmsTiptapJson } from "@/lib/cms/types";
import { tiptapJsonToPlainText } from "@/lib/cms/tiptap";

const TEXT_ALIGN = { textAlign: null } as const;

export function tiptapText(
  text: string,
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>,
): CmsTiptapJson {
  return marks ? { type: "text", text, marks } : { type: "text", text };
}

export function tiptapParagraphNode(text: string): CmsTiptapJson {
  return {
    type: "paragraph",
    attrs: { ...TEXT_ALIGN },
    content: text ? [tiptapText(text)] : [],
  };
}

export function tiptapHeadingNode(level: 1 | 2 | 3, text: string): CmsTiptapJson {
  return {
    type: "heading",
    attrs: { level, ...TEXT_ALIGN },
    content: [tiptapText(text)],
  };
}

export function tiptapLinkParagraph(label: string, href: string, linkText?: string): CmsTiptapJson {
  const displayText = linkText ?? href;
  return {
    type: "paragraph",
    attrs: { ...TEXT_ALIGN },
    content: [
      ...(label ? [tiptapText(label)] : []),
      tiptapText(displayText, [
        {
          type: "link",
          attrs: {
            href,
            target: "_blank",
            rel: "noopener noreferrer nofollow",
            class: null,
          },
        },
      ]),
    ],
  };
}

export function tiptapDocumentFromBlocks(blocks: CmsTiptapJson[]): CmsTiptapJson {
  return {
    type: "doc",
    content: blocks,
  };
}

export function plainStringToTiptapDocument(text: string): CmsTiptapJson {
  return tiptapDocumentFromBlocks([tiptapParagraphNode(text)]);
}

export function plainStringsToTiptapDocument(texts: readonly string[]): CmsTiptapJson {
  return tiptapDocumentFromBlocks(texts.map((text) => tiptapParagraphNode(text)));
}

export function faqAnswerToTiptapDocument(answer: string | readonly string[]): CmsTiptapJson {
  const paragraphs = typeof answer === "string" ? [answer] : [...answer];
  return plainStringsToTiptapDocument(paragraphs);
}

export function isEmptyCmsTiptapDocument(value: unknown): boolean {
  return tiptapJsonToPlainText(value as CmsTiptapJson | null).trim().length === 0;
}

export function cmsFieldHasExistingContent(input: {
  draftJson: unknown;
  publishedJson: unknown;
}): boolean {
  if (!isEmptyCmsTiptapDocument(input.draftJson)) {
    return true;
  }

  return !isEmptyCmsTiptapDocument(input.publishedJson);
}
