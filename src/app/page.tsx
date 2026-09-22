import type { Metadata } from "next";
import { getPublicHomeContent, getPublicHomeMetadata } from "@/lib/cms/public-content";
import { PublicHomePage } from "@/components/public/PublicHomePage";
import { buildPublicMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await getPublicHomeMetadata("en");

  return {
    ...buildPublicMetadata({
      locale: "en",
      page: "",
      title,
      description,
    }),
    title: {
      absolute: title,
    },
  };
}

export default async function Home() {
  const { content, cmsHtmlFields } = await getPublicHomeContent("en");

  return <PublicHomePage content={content} locale="en" cmsHtmlFields={cmsHtmlFields} />;
}
