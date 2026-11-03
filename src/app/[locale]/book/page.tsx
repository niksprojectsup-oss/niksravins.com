import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getResolvedPublicContent } from "@/lib/i18n/resolve-public-content";
import { PublicBookPage } from "@/components/public/PublicBookPage";
import { parseLocaleParam } from "@/lib/i18n/locales";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { applyOfferTranslations } from "@/lib/booking/localize-offer";
import { getBookableServices } from "@/lib/booking/services-catalog";
import {
  isLatvianBookingEnabled,
  shouldBlockLatvianBooking,
} from "@/lib/booking/feature-flags";

export const dynamic = "force-dynamic";

type LocaleBookPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: LocaleBookPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = parseLocaleParam(localeParam);
  if (!locale) return {};

  const content = await getResolvedPublicContent(locale);
  return buildPublicMetadata({
    locale,
    page: "book",
    title: content.seo.book.title,
    description: content.seo.book.description,
  });
}

export default async function LocaleBookPage({ params }: LocaleBookPageProps) {
  const { locale: localeParam } = await params;
  const locale = parseLocaleParam(localeParam);

  if (!locale) {
    notFound();
  }

  const content = await getResolvedPublicContent(locale);

  if (shouldBlockLatvianBooking(locale, await isLatvianBookingEnabled())) {
    return (
      <main className="mx-auto max-w-md px-6 py-16">
        <div className="observed-card p-6 md:p-7">
          <h1 className="type-heading-sm">Rezervācija šobrīd nav pieejama</h1>
          <p className="type-body mt-3 text-ink-subtle">
            Pašlaik online rezervācija latviešu valodā ir slēgta. Lūdzu,
            sazinieties ar mums tieši, lai vienotos par sesijas laiku.
          </p>
        </div>
      </main>
    );
  }

  const offers = applyOfferTranslations(await getBookableServices(), content.bookingOffers);

  return <PublicBookPage content={content} locale={locale} offers={offers} />;
}
