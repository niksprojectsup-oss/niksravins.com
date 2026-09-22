import type { Metadata } from "next";
import { PublicStandaloneCmsPage } from "@/components/public/PublicStandaloneCmsPage";
import { buildStandaloneCmsPageMetadata } from "@/lib/cms/standalone-page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildStandaloneCmsPageMetadata("contact");
}

export default async function ContactPage() {
  return <PublicStandaloneCmsPage slug="contact" />;
}
