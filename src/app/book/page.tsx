import type { Metadata } from "next";
import { getPublicContent } from "@/content/i18n";
import { PublicBookPage } from "@/components/public/PublicBookPage";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { applyOfferTranslations } from "@/lib/booking/localize-offer";
import {
  ensureDefaultOffersSeeded,
  getBookableServices,
} from "@/lib/booking/services-catalog";

const content = getPublicContent("en");

export const metadata: Metadata = buildPublicMetadata({
  locale: "en",
  page: "book",
  title: content.seo.book.title,
  description: content.seo.book.description,
});

export const dynamic = "force-dynamic";

export default async function BookPage() {
  await ensureDefaultOffersSeeded();
  const offers = applyOfferTranslations(await getBookableServices(), content.bookingOffers);

  return <PublicBookPage content={content} locale="en" offers={offers} />;
}
