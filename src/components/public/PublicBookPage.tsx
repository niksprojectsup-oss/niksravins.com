import type { PublicContent } from "@/content/i18n/types";
import type { Locale } from "@/lib/i18n/config";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { InternationalSessionNotice } from "@/components/i18n/InternationalSessionNotice";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBookJsonLd } from "@/lib/seo/json-ld";

type PublicBookPageProps = {
  content: PublicContent;
  locale: Locale;
};

export function PublicBookPage({ content, locale }: PublicBookPageProps) {
  return (
    <>
      <JsonLd data={buildBookJsonLd(content)} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-md focus:bg-surface focus:px-4 focus:py-3 focus:text-ink focus:shadow-soft"
      >
        Skip to content
      </a>

      <Header content={content} locale={locale} />

      <main id="main-content">
        <div className="layout-container">
          <InternationalSessionNotice
            line1={content.internationalNotice.line1}
            line2={content.internationalNotice.line2}
            variant="prominent"
            className="mt-6 max-w-prose"
          />
        </div>
        <BookingFlow content={content} />
      </main>

      <Footer content={content} locale={locale} />
    </>
  );
}
