import type { PublicContent } from "@/content/i18n/types";
import type { Locale } from "@/lib/i18n/config";
import type { BookableService } from "@/lib/booking/types";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { InternationalSessionNotice } from "@/components/i18n/InternationalSessionNotice";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBookJsonLd } from "@/lib/seo/json-ld";

type PublicBookPageProps = {
  content: PublicContent;
  locale: Locale;
  offers: BookableService[];
};

export function PublicBookPage({ content, locale, offers }: PublicBookPageProps) {
  return (
    <>
      <JsonLd data={buildBookJsonLd(content)} />

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
        <BookingFlow content={content} offers={offers} />
      </main>

      <Footer content={content} locale={locale} />
    </>
  );
}
