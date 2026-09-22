import type { Metadata } from "next";
import { PublicStandaloneCmsPage } from "@/components/public/PublicStandaloneCmsPage";
import { buildStandaloneCmsPageMetadata } from "@/lib/cms/standalone-page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildStandaloneCmsPageMetadata("legal");
}

export default async function LegalPage() {
  return <PublicStandaloneCmsPage slug="legal" />;
}
