import type { PublicContent } from "@/content/i18n/types";
import type { Locale } from "@/lib/i18n/config";
import type { TestContentTree } from "@/lib/identity-test/types";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { IdentityTestFlow } from "@/components/identity-test/IdentityTestFlow";

type PublicIdentityTestPageProps = {
  content: PublicContent;
  locale: Locale;
  tree: TestContentTree;
  consentLabel: string;
  bookingUrl: string;
};

export function PublicIdentityTestPage({
  content,
  locale,
  tree,
  consentLabel,
  bookingUrl,
}: PublicIdentityTestPageProps) {
  return (
    <>
      <Header content={content} locale={locale} />

      <main id="main-content" className="layout-container layout-section-md">
        <IdentityTestFlow
          tree={tree}
          ui={content.identityTest}
          locale={locale}
          consentLabel={consentLabel}
          bookingUrl={bookingUrl}
        />
      </main>

      <Footer content={content} locale={locale} />
    </>
  );
}
