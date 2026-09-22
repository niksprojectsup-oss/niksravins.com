import type { CmsContentBlock } from "@/content/cms/types";
import type { CmsTiptapJson } from "@/lib/cms/types";
import {
  plainStringToTiptapDocument,
  plainStringsToTiptapDocument,
  tiptapDocumentFromBlocks,
  tiptapHeadingNode,
  tiptapParagraphNode,
} from "@/lib/cms/import/tiptap-builders";

export function blocksToTiptapDocument(blocks: readonly CmsContentBlock[]): CmsTiptapJson {
  return tiptapDocumentFromBlocks(
    blocks.map((block) => {
      if (block.type === "heading") {
        return tiptapHeadingNode(block.level, block.text);
      }

      return tiptapParagraphNode(block.text);
    }),
  );
}

export function paragraphFieldToTiptapDocument(value: string | readonly string[]): CmsTiptapJson {
  if (typeof value === "string") {
    return plainStringToTiptapDocument(value);
  }

  return plainStringsToTiptapDocument(value);
}

export function flattenCmsParagraphField(value: string | readonly string[]): string {
  return typeof value === "string" ? value : value.join("\n\n");
}
