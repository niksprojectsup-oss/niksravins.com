import type { PublicContent } from "@/content/i18n/types";
import type { CmsHtmlFields } from "@/lib/cms/published-field-html";
import type { Locale } from "@/lib/i18n/config";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { About } from "@/components/sections/About";
import { AAPMethod } from "@/components/sections/AAPMethod";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Hero } from "@/components/sections/Hero";
import { Testimonials } from "@/components/sections/Testimonials";
import { Trust } from "@/components/sections/Trust";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildHomeJsonLd } from "@/lib/seo/json-ld";

type PublicHomePageProps = {
  content: PublicContent;
  locale: Locale;
  cmsHtmlFields?: CmsHtmlFields;
};

export function PublicHomePage({ content, locale, cmsHtmlFields = {} }: PublicHomePageProps) {
  return (
    <div className="min-h-screen bg-[#F5F1E8] text-[#2B2B27]">
      <JsonLd data={buildHomeJsonLd(content)} />
      <Header content={content} locale={locale} />
      <main>
        <Hero content={content} cmsHtmlFields={cmsHtmlFields} />
        <Trust content={content} cmsHtmlFields={cmsHtmlFields} />
        <About content={content} cmsHtmlFields={cmsHtmlFields} />
        <AAPMethod content={content} cmsHtmlFields={cmsHtmlFields} />
        <Testimonials content={content} />
        <FAQ content={content} cmsHtmlFields={cmsHtmlFields} />
        <FinalCTA content={content} cmsHtmlFields={cmsHtmlFields} />
      </main>
      <Footer content={content} locale={locale} />
    </div>
  );
}
