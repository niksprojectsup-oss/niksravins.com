import type { CmsLocale } from "@/lib/cms/definitions";

export type CmsTiptapJson = {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: CmsTiptapJson[];
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  text?: string;
};

export type CmsPageStatus = "DRAFT" | "PUBLISHED";

export type CmsContentValue = {
  fieldKey: string;
  draftJson: CmsTiptapJson | null;
  publishedJson: CmsTiptapJson | null;
  plainText: string | null;
  updatedAt: string;
};

export type CmsSectionContent = {
  key: string;
  title: string;
  sortOrder: number;
  fields: CmsContentValue[];
};

export type CmsPageContent = {
  slug: string;
  title: string;
  status: CmsPageStatus;
  locale: CmsLocale;
  sections: CmsSectionContent[];
  updatedAt: string;
};

export type CmsPageSummary = {
  id: string;
  slug: string;
  title: string;
  status: CmsPageStatus;
  updatedAt: string;
  locales: CmsLocale[];
};

export type CmsPublishedFieldMap = Record<string, string>;

export type CmsDraftSaveInput = {
  pageSlug: string;
  locale: CmsLocale;
  fields: Record<string, CmsTiptapJson | null>;
};

export type CmsPublishInput = {
  pageSlug: string;
  locale: CmsLocale;
};
