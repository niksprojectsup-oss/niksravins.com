import Link from "next/link";
import { redirect } from "next/navigation";
import { ClientLoginForm } from "@/components/client/ClientLoginForm";
import { PortalLanguageSwitcher } from "@/components/client/portal/PortalLanguageSwitcher";
import { getPortalContent } from "@/content/i18n/portal";
import { siteConfig } from "@/content/site";
import { getOptionalClientSession } from "@/lib/auth/client-guards";
import { getPortalLocale } from "@/lib/i18n/portal-locale";

type ClientLoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function ClientLoginPage({ searchParams }: ClientLoginPageProps) {
  const session = await getOptionalClientSession();
  if (session) {
    redirect("/client/dashboard");
  }

  const params = await searchParams;
  const locale = await getPortalLocale();
  const content = getPortalContent(locale);
  const initialError =
    params.error === "invalid-link" ? content.setPassword.invalidLink : undefined;

  return (
    <div className="layout-stack-md">
      <div className="layout-stack-sm text-center">
        <Link href="/" className="font-display text-2xl text-ink no-underline">
          {siteConfig.name}
        </Link>
        <p className="type-caption">{content.login.subtitle}</p>
      </div>

      <div className="flex justify-end">
        <PortalLanguageSwitcher locale={locale} label={content.languageSwitcherLabel} />
      </div>

      <div className="rounded-lg border border-border-subtle bg-surface p-6 md:p-8">
        <h1 className="type-heading-sm mb-6">{content.login.title}</h1>
        <ClientLoginForm nextPath={params.next} initialError={initialError} copy={content.login} />
      </div>
    </div>
  );
}
