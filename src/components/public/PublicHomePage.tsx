import type { PublicContent } from "@/content/i18n/types";
import type { CmsHtmlFields } from "@/lib/cms/published-field-html";
import type { Locale } from "@/lib/i18n/config";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { HomeBringSection } from "@/components/sections/home/HomeBringSection";
import { HomeFaqSection } from "@/components/sections/home/HomeFaqSection";
import { HomeFinalCtaSection } from "@/components/sections/home/HomeFinalCtaSection";
import { HomeHowWorkSection } from "@/components/sections/home/HomeHowWorkSection";
import { HomeIdentitySection } from "@/components/sections/home/HomeIdentitySection";
import { HomeLifeAreasSection } from "@/components/sections/home/HomeLifeAreasSection";
import { HomePossibleSection } from "@/components/sections/home/HomePossibleSection";
import { HomeTestimonialsSection } from "@/components/sections/home/HomeTestimonialsSection";
import { HomeUnderneathSection } from "@/components/sections/home/HomeUnderneathSection";
import { HomeWantChangeSection } from "@/components/sections/home/HomeWantChangeSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildHomeJsonLd } from "@/lib/seo/json-ld";

type PublicHomePageProps = {
  content: PublicContent;
  locale: Locale;
  cmsHtmlFields?: CmsHtmlFields;
};

export function PublicHomePage({ content, locale, cmsHtmlFields = {} }: PublicHomePageProps) {
  return (
    <div className="home-page min-h-screen text-[#2B2B27]">
      <JsonLd data={buildHomeJsonLd(content)} />
      <Header content={content} locale={locale} />
      <main>
        <Hero content={content} cmsHtmlFields={cmsHtmlFields} />
        <HomeWantChangeSection content={content} cmsHtmlFields={cmsHtmlFields} />
        <HomeLifeAreasSection content={content} cmsHtmlFields={cmsHtmlFields} />
        <HomeBringSection content={content} cmsHtmlFields={cmsHtmlFields} />
        <HomeIdentitySection content={content} cmsHtmlFields={cmsHtmlFields} />
        <HomeUnderneathSection content={content} cmsHtmlFields={cmsHtmlFields} />
        <HomeHowWorkSection content={content} cmsHtmlFields={cmsHtmlFields} />
        <HomePossibleSection content={content} cmsHtmlFields={cmsHtmlFields} />
        <HomeTestimonialsSection content={content} cmsHtmlFields={cmsHtmlFields} />
        <HomeFaqSection content={content} cmsHtmlFields={cmsHtmlFields} />
        <HomeFinalCtaSection content={content} cmsHtmlFields={cmsHtmlFields} />
      </main>
      <Footer content={content} locale={locale} />
    </div>
  );
}
