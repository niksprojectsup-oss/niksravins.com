import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPreviewChrome } from "@/components/admin/cms/CmsPreviewChrome";
import { CmsPublishedBody } from "@/components/cms/CmsPublishedBody";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PublicHomePage } from "@/components/public/PublicHomePage";
import { Section } from "@/components/ui/Section";
import { requireAdmin } from "@/lib/auth/guards";
import { getPreviewHomeContent, getPreviewLegalContent } from "@/lib/cms/preview-content";
import {
  assertCanPreviewCmsContent,
  parseCmsPreviewRequest,
} from "@/lib/cms/preview-page-content";
import { buildPrivateMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

type AdminCmsPreviewPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ locale?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: AdminCmsPreviewPageProps): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const parsed = parseCmsPreviewRequest({ slug, locale: query.locale });
  if (!parsed.ok) {
    return buildPrivateMetadata("Draft preview");
  }

  return buildPrivateMetadata(`Draft preview · ${parsed.slug} · ${parsed.locale}`);
}

function LegalPreviewFallback({
  heading,
  body,
  contactLabel,
  email,
}: {
  heading: string;
  body: string;
  contactLabel: string;
  email: string;
}) {
  return (
    <Section size="lg" aria-labelledby="legal-heading">
      <div className="max-w-prose layout-stack-md">
        <h1 id="legal-heading" className="type-heading">
          {heading}
        </h1>
        <p className="type-body">{body}</p>
        <p className="type-body">
          {contactLabel}{" "}
          <a href={`mailto:${email}`} className="text-accent underline">
            {email}
          </a>
        </p>
      </div>
    </Section>
  );
}

export default async function AdminCmsPreviewPage({
  params,
  searchParams,
}: AdminCmsPreviewPageProps) {
  const session = await requireAdmin();
  assertCanPreviewCmsContent(session.role);

  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const parsed = parseCmsPreviewRequest({ slug, locale: query.locale });
  if (!parsed.ok) {
    notFound();
  }

  if (parsed.slug === "home") {
    const { content, cmsHtmlFields } = await getPreviewHomeContent(parsed.locale);
    return (
      <CmsPreviewChrome slug={parsed.slug} locale={parsed.locale}>
        <PublicHomePage
          content={content}
          locale={parsed.locale}
          cmsHtmlFields={cmsHtmlFields}
        />
      </CmsPreviewChrome>
    );
  }

  const { content, body } = await getPreviewLegalContent(parsed.locale);

  return (
    <CmsPreviewChrome slug={parsed.slug} locale={parsed.locale}>
      <Header content={content} locale={parsed.locale} />
      <main>
        {body ? (
          <Section size="lg" aria-labelledby="legal-cms-heading">
            <div className="max-w-wide">
              <CmsPublishedBody document={body} />
            </div>
          </Section>
        ) : (
          <LegalPreviewFallback
            heading={content.legal.heading}
            body={content.legal.body}
            contactLabel={content.legal.contactLabel}
            email={content.site.email}
          />
        )}
      </main>
      <Footer content={content} locale={parsed.locale} />
    </CmsPreviewChrome>
  );
}
