import type { PublicContent } from "@/content/i18n/types";
import type { Locale } from "@/lib/i18n/config";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export function IdentityTestClosedNotice({
  content,
  locale,
}: {
  content: PublicContent;
  locale: Locale;
}) {
  return (
    <>
      <Header content={content} locale={locale} />
      <main id="main-content" className="layout-container layout-section-md">
        <section className="mx-auto max-w-xl py-10 text-center md:py-16">
          <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
              <path d="M8.5 10.5V7.8a3.5 3.5 0 0 1 7 0v2.7" />
              <circle cx="12" cy="15" r="1.2" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <h1 className="font-display text-3xl tracking-tight text-ink md:text-4xl">
            {content.identityTest.closed.heading}
          </h1>
          <p className="type-body mt-4 text-ink-muted">{content.identityTest.closed.body}</p>
        </section>
      </main>
      <Footer content={content} locale={locale} />
    </>
  );
}
