import type { Metadata } from "next";
import { getPublicContent } from "@/content/i18n";
import { PublicBookPage } from "@/components/public/PublicBookPage";
import { buildPublicMetadata } from "@/lib/seo/metadata";

const content = getPublicContent("en");

export const metadata: Metadata = buildPublicMetadata({
  locale: "en",
  page: "book",
  title: content.seo.book.title,
  description: content.seo.book.description,
});

export const dynamic = "force-dynamic";

export default function BookPage() {
  return <PublicBookPage content={content} locale="en" />;
}
