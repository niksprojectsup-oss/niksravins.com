import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicContent } from "@/content/i18n";
import { PublicPaymentSuccessPage } from "@/components/public/PublicPaymentSuccessPage";
import { parseLocaleParam } from "@/lib/i18n/locales";
import { verifyCheckoutSession } from "@/lib/stripe/verify-checkout-session";

export const dynamic = "force-dynamic";

type LocaleBookSuccessPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string }>;
};

export async function generateMetadata({
  params,
}: LocaleBookSuccessPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = parseLocaleParam(localeParam);
  if (!locale) return {};

  const content = getPublicContent(locale);
  return {
    title: content.bookingUi.paymentSuccess.title,
    robots: { index: false, follow: false },
  };
}

export default async function LocaleBookSuccessPage({
  params,
  searchParams,
}: LocaleBookSuccessPageProps) {
  const [{ locale: localeParam }, query] = await Promise.all([params, searchParams]);
  const locale = parseLocaleParam(localeParam);

  if (!locale) {
    notFound();
  }

  const content = getPublicContent(locale);
  const state = await verifyCheckoutSession(query.session_id);

  return (
    <PublicPaymentSuccessPage content={content} locale={locale} state={state} />
  );
}
