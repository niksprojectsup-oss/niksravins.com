import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { TranslationManager } from "@/components/admin/translations/TranslationManager";
import { adminPages } from "@/content/admin";
import { getBookableServices } from "@/lib/booking/services-catalog";
import {
  TRANSLATION_LOCALES,
  isTranslationLocale,
  type TranslationLocale,
} from "@/lib/i18n/translation-locales";
import {
  listTranslationRows,
  seedTranslationCatalog,
} from "@/lib/i18n/translation-repository";

export const dynamic = "force-dynamic";

type AdminTranslationsPageProps = {
  searchParams: Promise<{ locale?: string }>;
};

export default async function AdminTranslationsPage({
  searchParams,
}: AdminTranslationsPageProps) {
  const params = await searchParams;
  const locale: TranslationLocale = isTranslationLocale(params.locale ?? "")
    ? params.locale!
    : "de";

  let extraOfferIds: string[] = [];
  try {
    extraOfferIds = (await getBookableServices()).map((offer) => offer.id);
  } catch {
    extraOfferIds = [];
  }

  await seedTranslationCatalog(extraOfferIds);
  const rows = await listTranslationRows(locale);

  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader
        title={adminPages.translations.title}
        description={adminPages.translations.description}
      />
      <TranslationManager
        locale={locale}
        locales={[...TRANSLATION_LOCALES]}
        rows={rows}
      />
    </div>
  );
}
