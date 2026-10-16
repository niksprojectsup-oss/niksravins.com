export const CMS_FONT_SIZE_PRESETS = [
  8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 48, 60, 72,
] as const;

export const CMS_FONT_SIZE_MIN = 1;
export const CMS_FONT_SIZE_MAX = 200;

export const CMS_FONT_FAMILIES = [
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Fraunces", value: "var(--font-family-display), Fraunces, serif" },
  { label: "Unna", value: "var(--font-family-unna), Unna, serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: '"Times New Roman", Times, serif' },
  { label: "Courier New", value: '"Courier New", Courier, monospace' },
  { label: "System UI", value: "system-ui, sans-serif" },
] as const;

export function cmsFontFamilyOption(value: string | null | undefined) {
  return CMS_FONT_FAMILIES.find((entry) => entry.value === value) ?? CMS_FONT_FAMILIES[0];
}

export const CMS_TEXT_COLORS = [
  { label: "Black", value: "#111111" },
  { label: "Dark gray", value: "#4b5563" },
  { label: "Gray", value: "#9ca3af" },
  { label: "Red", value: "#dc2626" },
  { label: "Orange", value: "#ea580c" },
  { label: "Yellow", value: "#ca8a04" },
  { label: "Green", value: "#16a34a" },
  { label: "Blue", value: "#2563eb" },
  { label: "Purple", value: "#9333ea" },
] as const;

export const CMS_LETTER_SPACINGS = [
  { label: "Tight", value: "-0.03em" },
  { label: "Snug", value: "-0.018em" },
  { label: "Normal", value: "normal" },
  { label: "Wide", value: "0.055em" },
  { label: "Wider", value: "0.12em" },
] as const;

export const CMS_TEXT_TRANSFORMS = [
  { label: "None", value: "none" },
  { label: "Uppercase", value: "uppercase" },
  { label: "Lowercase", value: "lowercase" },
  { label: "Capitalize", value: "capitalize" },
] as const;

export const CMS_FONT_WEIGHTS = [
  { label: "Regular", value: "400" },
  { label: "Medium", value: "500" },
  { label: "Semibold", value: "600" },
  { label: "Bold", value: "700" },
] as const;

export const CMS_LINE_HEIGHTS = [
  { label: "1.0", value: "1" },
  { label: "1.15", value: "1.15" },
  { label: "1.5", value: "1.5" },
  { label: "2.0", value: "2" },
] as const;

export const CMS_PARAGRAPH_SPACINGS = [
  { label: "Compact", value: "compact" },
  { label: "Normal", value: "normal" },
  { label: "Relaxed", value: "relaxed" },
] as const;

export function normalizeCustomFontSizeInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null;

  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric) || numeric < CMS_FONT_SIZE_MIN || numeric > CMS_FONT_SIZE_MAX) {
    return null;
  }

  return `${numeric}px`;
}

export function parseFontSizeValue(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(/px$/i, "");
}
