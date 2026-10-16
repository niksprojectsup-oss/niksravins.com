import { notFound } from "next/navigation";
import { getFilePublicContent } from "@/content/i18n";
import { CmsPageEditor } from "@/components/admin/cms/CmsPageEditor";
import { withCatalogSectionHeadingDrafts } from "@/lib/cms/build-locale-cms-fields";
import { assertCmsLocale, getAdminPageContent } from "@/lib/cms/repository";
import { getCmsPageDefinition, isAdminEditableCmsPageSlug } from "@/lib/cms/definitions";
import { seedCmsPages } from "@/lib/cms/seed";

type AdminContentEditorPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ locale?: string }>;
};

export default async function AdminContentEditorPage({
  params,
  searchParams,
}: AdminContentEditorPageProps) {
  const { slug } = await params;
  const query = await searchParams;

  if (!getCmsPageDefinition(slug) || !isAdminEditableCmsPageSlug(slug)) {
    notFound();
  }

  await seedCmsPages();

  const locale = assertCmsLocale(query.locale ?? "en");
  const content = await getAdminPageContent(slug, locale);

  if (!content) {
    notFound();
  }

  const initialContent =
    slug === "home"
      ? withCatalogSectionHeadingDrafts(content, getFilePublicContent(locale))
      : content;

  return <CmsPageEditor initialContent={initialContent} locale={locale} />;
}
