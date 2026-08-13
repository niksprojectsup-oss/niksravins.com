import type { PublicContent } from "@/content/i18n/types";
import { getAppBaseUrl } from "@/lib/url";
import { localizedPath } from "@/lib/i18n/paths";

function faqAnswerText(answer: string | string[]): string {
  return Array.isArray(answer) ? answer.join(" ") : answer;
}

export function buildHomeJsonLd(content: PublicContent) {
  const baseUrl = getAppBaseUrl();
  const pageUrl = `${baseUrl}${localizedPath(content.locale, "")}`;

  return [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: content.site.name,
      url: pageUrl,
      email: content.site.email,
      jobTitle: content.site.brandDescriptor,
      knowsAbout: [content.site.method, "Deep Transformation", "Psychotherapy"],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: content.site.name,
      url: baseUrl,
      inLanguage: content.locale === "zh" ? "zh-Hans" : content.locale,
      description: content.seo.home.description,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: content.faq.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faqAnswerText(item.answer),
        },
      })),
    },
  ];
}

export function buildBookJsonLd(content: PublicContent) {
  const baseUrl = getAppBaseUrl();
  const pageUrl = `${baseUrl}${localizedPath(content.locale, "book")}`;

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: content.seo.book.title,
      url: pageUrl,
      description: content.seo.book.description,
      inLanguage: content.locale === "zh" ? "zh-Hans" : content.locale,
      isPartOf: {
        "@type": "WebSite",
        name: content.site.name,
        url: baseUrl,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Online Transformation Session",
      provider: {
        "@type": "Person",
        name: content.site.name,
      },
      serviceType: content.site.method,
      areaServed: "Worldwide",
      availableLanguage: "English",
      description: content.seo.book.description,
    },
  ];
}
