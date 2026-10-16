import type { Metadata } from "next";
import { PublicBookPage } from "@/components/public/PublicBookPage";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { applyOfferTranslations } from "@/lib/booking/localize-offer";
import {
  ensureDefaultOffersSeeded,
  getBookableServices,
} from "@/lib/booking/services-catalog";
import { getResolvedPublicContent } from "@/lib/i18n/resolve-public-content";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getResolvedPublicContent("en");
  return buildPublicMetadata({
    locale: "en",
    page: "book",
    title: content.seo.book.title,
    description: content.seo.book.description,
  });
}

export default async function BookPage() {
  await ensureDefaultOffersSeeded();
  const content = await getResolvedPublicContent("en");
  const offers = applyOfferTranslations(await getBookableServices(), content.bookingOffers);

  return <PublicBookPage content={content} locale="en" offers={offers} />;
}
