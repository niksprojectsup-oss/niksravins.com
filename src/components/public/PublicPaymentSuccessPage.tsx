import type { PublicContent } from "@/content/i18n/types";
import type { Locale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";
import type { PaymentSuccessState } from "@/lib/stripe/verify-checkout-session";
import { PaymentSuccessScreen } from "@/components/booking/PaymentSuccessScreen";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

type PublicPaymentSuccessPageProps = {
  content: PublicContent;
  locale: Locale;
  state: PaymentSuccessState;
};

export function PublicPaymentSuccessPage({
  content,
  locale,
  state,
}: PublicPaymentSuccessPageProps) {
  return (
    <>
      <Header content={content} locale={locale} />

      <main id="main-content">
        <div className="layout-container">
          <PaymentSuccessScreen
            state={state}
            labels={content.bookingUi}
            homeHref={localizedPath(locale, "")}
            bookHref={localizedPath(locale, "book")}
            internationalNotice={content.internationalNotice}
          />
        </div>
      </main>

      <Footer content={content} locale={locale} />
    </>
  );
}
