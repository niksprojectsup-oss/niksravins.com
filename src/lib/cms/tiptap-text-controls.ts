import { Extension } from "@tiptap/core";

const LETTER_SPACING = /^(?:normal|0|-?\d+(?:\.\d+)?em)$/;
export const CMS_TEXT_TRANSFORM_VALUES = ["none", "uppercase", "lowercase", "capitalize"] as const;
export type CmsTextTransform = (typeof CMS_TEXT_TRANSFORM_VALUES)[number];
const TEXT_TRANSFORMS = new Set<string>(CMS_TEXT_TRANSFORM_VALUES);
const FONT_WEIGHTS = new Set(["400", "500", "600", "700"]);

type CmsTextTransformChain = {
  focus: () => CmsTextTransformChain;
  setMark: (type: string, attributes: { textTransform: string | null }) => CmsTextTransformChain;
  removeEmptyTextStyle: () => CmsTextTransformChain;
  run: () => boolean;
};

type CmsTextTransformEditor = {
  chain: () => CmsTextTransformChain;
};

/** Writes text-transform through TipTap's built-in textStyle mark. `null` clears only that attribute. */
export function applyCmsTextTransform(editor: CmsTextTransformEditor, value: CmsTextTransform | null): boolean {
  const styled =
    value === null
      ? editor.chain().setMark("textStyle", { textTransform: null }).removeEmptyTextStyle().run()
      : TEXT_TRANSFORMS.has(value)
        ? editor.chain().setMark("textStyle", { textTransform: value }).run()
        : false;
  editor.chain().focus().run();
  return styled;
}

function styleValue(property: string, value: string | null | undefined, allowed: (value: string) => boolean) {
  if (!value || !allowed(value)) return {};
  return { style: `${property}: ${value}` };
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    cmsTextControls: {
      setLetterSpacing: (value: string) => ReturnType;
      unsetLetterSpacing: () => ReturnType;
      setTextTransform: (value: string) => ReturnType;
      unsetTextTransform: () => ReturnType;
      setFontWeight: (value: string) => ReturnType;
      unsetFontWeight: () => ReturnType;
    };
  }
}

/** Optional textStyle attributes. An empty value writes nothing, so existing documents keep the section default. */
export const CmsTextControls = Extension.create({
  name: "cmsTextControls",

  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          letterSpacing: {
            default: null,
            parseHTML: (element) => element.style.letterSpacing || null,
            renderHTML: (attributes) =>
              styleValue("letter-spacing", attributes.letterSpacing as string | null, (value) =>
                LETTER_SPACING.test(value),
              ),
          },
          textTransform: {
            default: null,
            parseHTML: (element) => element.style.textTransform || null,
            renderHTML: (attributes) =>
              styleValue("text-transform", attributes.textTransform as string | null, (value) =>
                TEXT_TRANSFORMS.has(value),
              ),
          },
          fontWeight: {
            default: null,
            parseHTML: (element) => element.style.fontWeight || null,
            renderHTML: (attributes) =>
              styleValue("font-weight", attributes.fontWeight as string | null, (value) =>
                FONT_WEIGHTS.has(value),
              ),
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLetterSpacing:
        (value) =>
        ({ chain }) =>
          LETTER_SPACING.test(value) && chain().setMark("textStyle", { letterSpacing: value }).run(),
      unsetLetterSpacing:
        () =>
        ({ chain }) =>
          chain().setMark("textStyle", { letterSpacing: null }).removeEmptyTextStyle().run(),
      setTextTransform:
        (value) =>
        ({ commands }) => {
          if (!TEXT_TRANSFORMS.has(value)) return false;
          return commands.setMark("textStyle", { textTransform: value });
        },
      unsetTextTransform:
        () =>
        ({ commands }) =>
          commands.setMark("textStyle", { textTransform: null }) && commands.removeEmptyTextStyle(),
      setFontWeight:
        (value) =>
        ({ chain }) =>
          FONT_WEIGHTS.has(value) && chain().setMark("textStyle", { fontWeight: value }).run(),
      unsetFontWeight:
        () =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontWeight: null }).removeEmptyTextStyle().run(),
    };
  },
});
