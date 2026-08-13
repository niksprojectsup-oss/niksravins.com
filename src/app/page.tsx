import type { Metadata } from "next";
import { getPublicContent } from "@/content/i18n";
import { PublicHomePage } from "@/components/public/PublicHomePage";
import { buildPublicMetadata } from "@/lib/seo/metadata";

const content = getPublicContent("en");

export const metadata: Metadata = {
  ...buildPublicMetadata({
    locale: "en",
    page: "",
    title: content.seo.home.title,
    description: content.seo.home.description,
  }),
  title: {
    absolute: content.seo.home.title,
  },
};

export default function Home() {
  return <PublicHomePage content={content} locale="en" />;
}
