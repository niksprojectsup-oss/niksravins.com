export type CmsContentBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string };

export type CmsParagraphField = string | readonly string[];
