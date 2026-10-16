import type { Mark, ResolvedPos } from "@tiptap/pm/model";
import type { EditorState } from "@tiptap/pm/state";

/**
 * Sizes the CMS editor paints when text has no `textStyle.fontSize` mark.
 *
 * Paragraphs inherit `.type-body` (`--nr-text-base: 1.125rem` → 18px at a 16px root).
 * Heading levels use the global heading rules: h2 is `--nr-text-3xl` (54px),
 * h3 is `--nr-text-xl` (32px). h1 is `--nr-text-display`
 * (`clamp(2.875rem, 6vw + 1rem, 5.25rem)` → 46px–84px), so it is not one pixel size.
 */
export const CMS_EDITOR_BODY_FONT_SIZE_LABEL = "18";

export const CMS_EDITOR_HEADING_FONT_SIZE_LABEL = {
  1: "46-84",
  2: "54",
  3: "32",
} as const;

export const CMS_FONT_SIZE_MIXED_LABEL = "Mixed";
export const CMS_FONT_SIZE_INHERIT_LABEL = "Inherit";

export type ActiveFontSize =
  | { status: "size"; source: "explicit"; label: string }
  | {
      status: "size";
      source: "inherited";
      label: typeof CMS_FONT_SIZE_INHERIT_LABEL;
      /** Editor preview size in px, when every selected block shares one. Not the published size. */
      editorLabel: string | null;
    }
  | { status: "mixed" };

type FontSizeSample = {
  label: string;
  explicit: boolean;
};

export function normalizeFontSizeLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const px = trimmed.match(/^(\d+(?:\.\d+)?)\s*px$/i);
  if (!px) return trimmed;

  const numeric = Number(px[1]);
  if (!Number.isFinite(numeric)) return trimmed;
  return String(numeric);
}

export function activeFontSizeControlText(inspection: ActiveFontSize): string {
  if (inspection.status === "mixed") return CMS_FONT_SIZE_MIXED_LABEL;
  if (inspection.source === "inherited") return CMS_FONT_SIZE_INHERIT_LABEL;
  return inspection.label;
}

export function activeFontSizeEditorHint(inspection: ActiveFontSize): string | null {
  if (inspection.status !== "size" || inspection.source !== "inherited") return null;
  return inspection.editorLabel;
}

export function fontSizeControlName(inspection: ActiveFontSize): string {
  if (inspection.status === "mixed") return "Font size, mixed";
  if (inspection.source === "inherited") {
    return inspection.editorLabel
      ? `Font size, inherited from the page. Editor preview ${inspection.editorLabel}px`
      : "Font size, inherited from the page";
  }
  return `Font size ${inspection.label}`;
}

export function fontSizeInspectionsEqual(current: ActiveFontSize, next: ActiveFontSize): boolean {
  if (current.status !== next.status) return false;
  if (current.status === "mixed" || next.status === "mixed") return true;
  if (current.source !== next.source || current.label !== next.label) return false;
  if (current.source === "inherited" && next.source === "inherited") {
    return current.editorLabel === next.editorLabel;
  }
  return true;
}

export function fontSizePresetIsActive(inspection: ActiveFontSize, presetPx: number): boolean {
  return (
    inspection.status === "size" &&
    inspection.source === "explicit" &&
    inspection.label === String(presetPx)
  );
}

export function fontSizeInheritIsActive(inspection: ActiveFontSize): boolean {
  return inspection.status === "size" && inspection.source === "inherited";
}

/** Inherit is already the stored state. Clearing would rewrite unformatted text. */
export function shouldClearExplicitFontSize(inspection: ActiveFontSize): boolean {
  return !fontSizeInheritIsActive(inspection);
}

function explicitFontSizeLabel(marks: readonly Mark[]): string | null {
  for (const mark of marks) {
    if (mark.type.name !== "textStyle") continue;
    const label = normalizeFontSizeLabel(mark.attrs.fontSize as string | null | undefined);
    if (label) return label;
  }
  return null;
}

function inheritedFontSizeLabel($pos: ResolvedPos): string {
  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    const node = $pos.node(depth);
    if (node.type.name !== "heading") continue;

    const level = Number(node.attrs.level);
    if (level === 1) return CMS_EDITOR_HEADING_FONT_SIZE_LABEL[1];
    if (level === 2) return CMS_EDITOR_HEADING_FONT_SIZE_LABEL[2];
    if (level === 3) return CMS_EDITOR_HEADING_FONT_SIZE_LABEL[3];
    return CMS_EDITOR_BODY_FONT_SIZE_LABEL;
  }

  return CMS_EDITOR_BODY_FONT_SIZE_LABEL;
}

function sampleAt(state: EditorState, pos: number, marks: readonly Mark[]): FontSizeSample {
  const explicit = explicitFontSizeLabel(marks);
  if (explicit) return { label: explicit, explicit: true };
  return { label: inheritedFontSizeLabel(state.doc.resolve(pos)), explicit: false };
}

function inheritedInspection(samples: FontSizeSample[]): ActiveFontSize {
  const editorLabels = new Set(samples.map((sample) => sample.label));
  return {
    status: "size",
    source: "inherited",
    label: CMS_FONT_SIZE_INHERIT_LABEL,
    editorLabel: editorLabels.size === 1 ? (samples[0]?.label ?? CMS_EDITOR_BODY_FONT_SIZE_LABEL) : null,
  };
}

function summarize(samples: FontSizeSample[]): ActiveFontSize {
  if (samples.length === 0 || samples.every((sample) => !sample.explicit)) {
    return inheritedInspection(samples.length === 0 ? [{ label: CMS_EDITOR_BODY_FONT_SIZE_LABEL, explicit: false }] : samples);
  }

  if (samples.some((sample) => !sample.explicit)) return { status: "mixed" };

  const labels = new Set(samples.map((sample) => sample.label));
  if (labels.size > 1) return { status: "mixed" };

  return { status: "size", source: "explicit", label: samples[0].label };
}

export function inspectActiveFontSize(state: EditorState): ActiveFontSize {
  const { selection } = state;

  if (selection.empty) {
    const marks = state.storedMarks ?? selection.$from.marks();
    return summarize([sampleAt(state, selection.from, marks)]);
  }

  const samples: FontSizeSample[] = [];
  state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
    if (!node.isText || !node.text) return;
    samples.push(sampleAt(state, pos, node.marks));
  });

  if (samples.length === 0) {
    return summarize([sampleAt(state, selection.from, selection.$from.marks())]);
  }

  return summarize(samples);
}
