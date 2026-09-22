import { notFound } from "next/navigation";
import { CmsPageEditor } from "@/components/admin/cms/CmsPageEditor";
import { assertCmsLocale, getAdminPageContent } from "@/lib/cms/repository";
import { getCmsPageDefinition } from "@/lib/cms/definitions";
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

  if (!getCmsPageDefinition(slug)) {
    notFound();
  }

  await seedCmsPages();

  const locale = assertCmsLocale(query.locale ?? "en");
  const content = await getAdminPageContent(slug, locale);

  if (!content) {
    notFound();
  }

  return <CmsPageEditor initialContent={content} locale={locale} />;
}
