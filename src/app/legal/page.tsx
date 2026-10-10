import type { Metadata } from "next";
import { getPublicContent } from "@/content/i18n";
import { PublicStandaloneCmsPage } from "@/components/public/PublicStandaloneCmsPage";
import { buildPublicMetadata } from "@/lib/seo/metadata";

const content = getPublicContent("en");

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata({
    locale: "en",
    page: "legal",
    title: content.seo.legal.title,
    description: content.seo.legal.description,
  });
}

export default async function LegalPage() {
  return <PublicStandaloneCmsPage slug="legal" locale="en" />;
}
