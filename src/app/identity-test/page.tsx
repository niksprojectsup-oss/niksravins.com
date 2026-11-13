import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getResolvedPublicContent } from "@/lib/i18n/resolve-public-content";
import { PublicIdentityTestPage } from "@/components/public/PublicIdentityTestPage";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { getPublicTestContent, loadConsentText } from "@/lib/identity-test/repository";
import { isBetaRequestAllowed } from "@/lib/identity-test/beta";
import { IdentityTestClosedNotice } from "@/components/public/IdentityTestClosedNotice";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getResolvedPublicContent("en");
  return buildPublicMetadata({
    locale: "en",
    page: "identity-test",
    title: content.identityTest.seo.title,
    description: content.identityTest.seo.description,
  });
}

export default async function IdentityTestPage() {
  const [content, tree, consentText] = await Promise.all([
    getResolvedPublicContent("en"),
    getPublicTestContent("en"),
    loadConsentText("en"),
  ]);

  if (tree.themes.length === 0) {
    notFound();
  }

  if (!(await isBetaRequestAllowed())) {
    return <IdentityTestClosedNotice content={content} locale="en" />;
  }

  return (
    <PublicIdentityTestPage
      content={content}
      locale="en"
      tree={tree}
      consentLabel={consentText?.value ?? ""}
      bookingUrl="/book"
    />
  );
}
