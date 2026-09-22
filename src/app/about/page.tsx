import type { Metadata } from "next";
import { PublicStandaloneCmsPage } from "@/components/public/PublicStandaloneCmsPage";
import { buildStandaloneCmsPageMetadata } from "@/lib/cms/standalone-page-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildStandaloneCmsPageMetadata("about");
}

export default async function AboutPage() {
  return <PublicStandaloneCmsPage slug="about" />;
}
