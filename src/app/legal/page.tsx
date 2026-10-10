import type { Metadata } from "next";
import { PublicStandaloneCmsPage } from "@/components/public/PublicStandaloneCmsPage";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { getResolvedPublicContent } from "@/lib/i18n/resolve-public-content";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getResolvedPublicContent("en");
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
