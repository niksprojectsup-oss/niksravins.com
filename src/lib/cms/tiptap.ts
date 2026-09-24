import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style/text-style-kit";
import Image from "@tiptap/extension-image";
import StarterKit from "@tiptap/starter-kit";
import type { Extensions } from "@tiptap/core";
import { ParagraphSpacing } from "@/lib/cms/tiptap-paragraph-spacing";
import type { CmsTiptapJson } from "@/lib/cms/types";

function getCmsCoreExtensions(): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      link: {
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      },
    }),
    TextStyleKit.configure({
      backgroundColor: false,
    }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    ParagraphSpacing,
    Image.configure({
      inline: false,
      allowBase64: false,
      HTMLAttributes: {
        class: "cms-editor-image",
      },
      resize: {
        enabled: true,
        minWidth: 80,
        minHeight: 80,
        alwaysPreserveAspectRatio: true,
      },
    }),
  ];
}

export function getCmsEditorExtensions(placeholder?: string): Extensions {
  return [
    ...getCmsCoreExtensions(),
    Placeholder.configure({
      placeholder: placeholder ?? "Start writing…",
    }),
  ];
}

export const CMS_TIPTAP_EXTENSIONS = getCmsCoreExtensions();

export function createEmptyTiptapDocument(text = ""): CmsTiptapJson {
  if (!text.trim()) {
    return { type: "doc", content: [{ type: "paragraph" }] };
  }

  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text }],
      },
    ],
  };
}

export function tiptapJsonToPlainText(value: CmsTiptapJson | null | undefined): string {
  if (!value) return "";

  const blocks: string[] = [];

  function walk(node: CmsTiptapJson) {
    if (node.type === "text" && node.text) {
      blocks.push(node.text);
      return;
    }

    if (node.type === "hardBreak") {
      blocks.push("\n");
      return;
    }

    if (node.content) {
      for (const child of node.content) {
        walk(child);
      }
    }

    if (node.type === "paragraph" || node.type === "heading") {
      blocks.push("\n");
    }
  }

  walk(value);
  return blocks
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function plainTextToTiptapDocument(text: string): CmsTiptapJson {
  return createEmptyTiptapDocument(text);
}

export function normalizeCmsTiptapJson(value: unknown): CmsTiptapJson | null {
  if (!value || typeof value !== "object") return null;
  const doc = value as CmsTiptapJson;
  if (doc.type !== "doc") return null;
  return JSON.parse(JSON.stringify(doc)) as CmsTiptapJson;
}

export function resolveCmsEditorDocument(
  draftJson: CmsTiptapJson | null | undefined,
  publishedJson: CmsTiptapJson | null | undefined,
): CmsTiptapJson {
  return (
    normalizeCmsTiptapJson(draftJson) ??
    normalizeCmsTiptapJson(publishedJson) ??
    createEmptyTiptapDocument()
  );
}

export function buildCmsEditorFieldMap(
  content: Pick<{ sections: Array<{ fields: Array<{ fieldKey: string; draftJson: CmsTiptapJson | null; publishedJson: CmsTiptapJson | null }> }> }, "sections">,
): Record<string, CmsTiptapJson> {
  const map: Record<string, CmsTiptapJson> = {};

  for (const section of content.sections) {
    for (const field of section.fields) {
      map[field.fieldKey] = resolveCmsEditorDocument(field.draftJson, field.publishedJson);
    }
  }

  return map;
}

export function normalizeIncomingTiptapValue(value: unknown): CmsTiptapJson | null {
  return normalizeCmsTiptapJson(value);
}

export function serializeCmsFieldsForAction(
  fields: Record<string, CmsTiptapJson | null>,
): Record<string, CmsTiptapJson | null> {
  return JSON.parse(JSON.stringify(fields)) as Record<string, CmsTiptapJson | null>;
}
