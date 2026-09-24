import { Extension } from "@tiptap/core";

export type CmsParagraphSpacing = "compact" | "normal" | "relaxed";

const SPACING_MARGIN: Record<CmsParagraphSpacing, string> = {
  compact: "0.35em",
  normal: "0.85em",
  relaxed: "1.35em",
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    paragraphSpacing: {
      setParagraphSpacing: (spacing: CmsParagraphSpacing) => ReturnType;
    };
  }
}

export const ParagraphSpacing = Extension.create({
  name: "paragraphSpacing",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph"],
        attributes: {
          paragraphSpacing: {
            default: "normal",
            parseHTML: (element) =>
              (element.getAttribute("data-paragraph-spacing") as CmsParagraphSpacing | null) ??
              "normal",
            renderHTML: (attributes) => {
              const spacing =
                (attributes.paragraphSpacing as CmsParagraphSpacing | null) ?? "normal";
              if (spacing === "normal") return {};

              return {
                "data-paragraph-spacing": spacing,
                style: `margin-bottom: ${SPACING_MARGIN[spacing]}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setParagraphSpacing:
        (spacing) =>
        ({ commands }) =>
          commands.updateAttributes("paragraph", { paragraphSpacing: spacing }),
    };
  },
});
