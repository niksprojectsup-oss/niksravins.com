import type { Metadata } from "next";
import { getResolvedPublicContent } from "@/lib/i18n/resolve-public-content";
import { PublicPaymentSuccessPage } from "@/components/public/PublicPaymentSuccessPage";
import { verifyCheckoutSession } from "@/lib/stripe/verify-checkout-session";

export const dynamic = "force-dynamic";

type BookSuccessPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const content = await getResolvedPublicContent("en");
  return {
    title: content.bookingUi.paymentSuccess.title,
    robots: { index: false, follow: false },
  };
}

export default async function BookSuccessPage({ searchParams }: BookSuccessPageProps) {
  const params = await searchParams;
  const content = await getResolvedPublicContent("en");
  const state = await verifyCheckoutSession(params.session_id);

  return (
    <PublicPaymentSuccessPage content={content} locale="en" state={state} />
  );
}
