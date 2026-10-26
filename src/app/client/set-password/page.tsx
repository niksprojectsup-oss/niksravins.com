import Link from "next/link";
import { redirect } from "next/navigation";
import { ClientSetPasswordForm } from "@/components/client/ClientSetPasswordForm";
import { PortalLanguageSwitcher } from "@/components/client/portal/PortalLanguageSwitcher";
import { getPortalContent } from "@/content/i18n/portal";
import { siteConfig } from "@/content/site";
import { getOptionalClientSession } from "@/lib/auth/client-guards";
import { getPortalLocale } from "@/lib/i18n/portal-locale";

type ClientSetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ClientSetPasswordPage({
  searchParams,
}: ClientSetPasswordPageProps) {
  const session = await getOptionalClientSession();
  if (session) {
    redirect("/client/dashboard");
  }

  const params = await searchParams;
  const token = params.token?.trim();

  const locale = await getPortalLocale();
  const content = getPortalContent(locale);

  if (!token) {
    redirect("/client/login?error=invalid-link");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12 text-ink">
      <div className="w-full max-w-md layout-stack-md">
        <div className="layout-stack-sm text-center">
          <Link href="/" className="font-display text-2xl text-ink no-underline">
            {siteConfig.name}
          </Link>
          <p className="type-caption">{content.setPassword.subtitle}</p>
        </div>

        <div className="flex justify-end">
          <PortalLanguageSwitcher locale={locale} label={content.languageSwitcherLabel} />
        </div>

        <div className="rounded-lg border border-border-subtle bg-surface p-6 md:p-8">
          <h1 className="type-heading-sm mb-6">{content.setPassword.title}</h1>
          <ClientSetPasswordForm token={token} copy={content.setPassword} />
        </div>
      </div>
    </div>
  );
}
