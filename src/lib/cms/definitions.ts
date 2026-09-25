export const CMS_LOCALES = ["en", "lv"] as const;

export type CmsLocale = (typeof CMS_LOCALES)[number];

export function isCmsLocale(value: string): value is CmsLocale {
  return CMS_LOCALES.includes(value as CmsLocale);
}

export type CmsFieldDefinition = {
  key: string;
  label: string;
  placeholder?: string;
  /** Hint for editor placeholder and merge behavior. */
  kind?: "plain" | "paragraphs" | "faq-answer";
};

export type CmsSectionDefinition = {
  key: string;
  title: string;
  sortOrder: number;
  fields: readonly CmsFieldDefinition[];
};

export type CmsPageDefinition = {
  slug: string;
  title: string;
  sortOrder: number;
  sections: readonly CmsSectionDefinition[];
};

export const CMS_PAGE_DEFINITIONS: readonly CmsPageDefinition[] = [
  {
    slug: "home",
    title: "Homepage",
    sortOrder: 0,
    sections: [
      {
        key: "hero",
        title: "Hero",
        sortOrder: 0,
        fields: [
          { key: "hero.headline", label: "Headline", placeholder: "Main headline" },
          {
            key: "hero.explanation.0",
            label: "Explanation card 1",
            placeholder: "First supporting paragraph",
            kind: "paragraphs",
          },
          {
            key: "hero.explanation.1",
            label: "Explanation card 2",
            placeholder: "Second supporting paragraph",
            kind: "paragraphs",
          },
          {
            key: "hero.explanation.2",
            label: "Explanation card 3",
            placeholder: "Third supporting paragraph",
            kind: "paragraphs",
          },
          { key: "hero.primaryCta.label", label: "Primary button label" },
          { key: "hero.secondaryCta.label", label: "Secondary button label" },
        ],
      },
      {
        key: "trust",
        title: "Trust",
        sortOrder: 1,
        fields: [
          { key: "trust.statements.0", label: "Statement 1", kind: "paragraphs" },
          { key: "trust.statements.1", label: "Statement 2", kind: "paragraphs" },
          { key: "trust.statements.2", label: "Statement 3", kind: "paragraphs" },
          { key: "trust.statements.3", label: "Statement 4", kind: "paragraphs" },
        ],
      },
      {
        key: "about",
        title: "About",
        sortOrder: 2,
        fields: [
          { key: "about.title", label: "Section title" },
          { key: "about.story.0", label: "Story paragraph 1", kind: "paragraphs" },
          { key: "about.story.1", label: "Story paragraph 2", kind: "paragraphs" },
          { key: "about.story.2", label: "Story paragraph 3", kind: "paragraphs" },
        ],
      },
      {
        key: "aap",
        title: "AAP",
        sortOrder: 3,
        fields: [
          { key: "aap.title", label: "Section title" },
          { key: "aap.intro", label: "Introduction", kind: "paragraphs" },
          { key: "aap.points.0.title", label: "Point 1 title" },
          { key: "aap.points.0.description", label: "Point 1 description", kind: "paragraphs" },
          { key: "aap.points.1.title", label: "Point 2 title" },
          { key: "aap.points.1.description", label: "Point 2 description", kind: "paragraphs" },
          { key: "aap.points.2.title", label: "Point 3 title" },
          { key: "aap.points.2.description", label: "Point 3 description", kind: "paragraphs" },
          { key: "aap.points.3.title", label: "Point 4 title" },
          { key: "aap.points.3.description", label: "Point 4 description", kind: "paragraphs" },
        ],
      },
      {
        key: "faq",
        title: "FAQ",
        sortOrder: 4,
        fields: [
          { key: "faq.headingLabel", label: "Heading label" },
          { key: "faq.heading", label: "Heading" },
          { key: "faq.items.0.question", label: "Question 1" },
          { key: "faq.items.0.answer", label: "Answer 1", kind: "faq-answer" },
          { key: "faq.items.1.question", label: "Question 2" },
          { key: "faq.items.1.answer", label: "Answer 2", kind: "faq-answer" },
          { key: "faq.items.2.question", label: "Question 3" },
          { key: "faq.items.2.answer", label: "Answer 3", kind: "faq-answer" },
          { key: "faq.items.3.question", label: "Question 4" },
          { key: "faq.items.3.answer", label: "Answer 4", kind: "faq-answer" },
          { key: "faq.items.4.question", label: "Question 5" },
          { key: "faq.items.4.answer", label: "Answer 5", kind: "faq-answer" },
          { key: "faq.items.5.question", label: "Question 6" },
          { key: "faq.items.5.answer", label: "Answer 6", kind: "faq-answer" },
        ],
      },
      {
        key: "final-cta",
        title: "Final CTA",
        sortOrder: 5,
        fields: [
          { key: "finalCta.lines.0", label: "Line 1", kind: "paragraphs" },
          { key: "finalCta.lines.1", label: "Line 2", kind: "paragraphs" },
          { key: "finalCta.lines.2", label: "Line 3", kind: "paragraphs" },
          { key: "finalCta.button.label", label: "Button label" },
        ],
      },
      {
        key: "seo",
        title: "SEO",
        sortOrder: 6,
        fields: [
          { key: "seo.home.title", label: "Page title" },
          { key: "seo.home.description", label: "Meta description", kind: "paragraphs" },
        ],
      },
    ],
  },
  {
    slug: "about",
    title: "About",
    sortOrder: 1,
    sections: [
      {
        key: "main",
        title: "Main content",
        sortOrder: 0,
        fields: [{ key: "body", label: "Body", kind: "paragraphs" }],
      },
    ],
  },
  {
    slug: "aap",
    title: "AAP",
    sortOrder: 2,
    sections: [
      {
        key: "main",
        title: "Main content",
        sortOrder: 0,
        fields: [{ key: "body", label: "Body", kind: "paragraphs" }],
      },
    ],
  },
  {
    slug: "faq",
    title: "FAQ",
    sortOrder: 3,
    sections: [
      {
        key: "main",
        title: "Main content",
        sortOrder: 0,
        fields: [{ key: "body", label: "Body", kind: "paragraphs" }],
      },
    ],
  },
  {
    slug: "contact",
    title: "Contact",
    sortOrder: 4,
    sections: [
      {
        key: "main",
        title: "Main content",
        sortOrder: 0,
        fields: [{ key: "body", label: "Body", kind: "paragraphs" }],
      },
    ],
  },
  {
    slug: "legal",
    title: "Legal",
    sortOrder: 5,
    sections: [
      {
        key: "main",
        title: "Main content",
        sortOrder: 0,
        fields: [{ key: "body", label: "Body", kind: "paragraphs" }],
      },
    ],
  },
] as const;

/** Standalone CMS pages kept in DB but no longer publicly editable or rendered. */
export const DEPRECATED_PUBLIC_CMS_PAGE_SLUGS = ["about", "aap", "faq", "contact"] as const;

export type DeprecatedPublicCmsPageSlug = (typeof DEPRECATED_PUBLIC_CMS_PAGE_SLUGS)[number];

export const ADMIN_EDITABLE_CMS_PAGE_SLUGS = ["home", "legal"] as const;

export function isDeprecatedPublicCmsPageSlug(slug: string): slug is DeprecatedPublicCmsPageSlug {
  return DEPRECATED_PUBLIC_CMS_PAGE_SLUGS.includes(slug as DeprecatedPublicCmsPageSlug);
}

export function isAdminEditableCmsPageSlug(slug: string): boolean {
  return ADMIN_EDITABLE_CMS_PAGE_SLUGS.includes(slug as (typeof ADMIN_EDITABLE_CMS_PAGE_SLUGS)[number]);
}

export function getCmsPageDefinition(slug: string): CmsPageDefinition | undefined {
  return CMS_PAGE_DEFINITIONS.find((page) => page.slug === slug);
}

export function getAllCmsFieldKeys(pageSlug: string): string[] {
  const page = getCmsPageDefinition(pageSlug);
  if (!page) return [];
  return page.sections.flatMap((section) => section.fields.map((field) => field.key));
}

export const CMS_LOCALE_LABELS: Record<CmsLocale, string> = {
  en: "English",
  lv: "Latvian",
};
