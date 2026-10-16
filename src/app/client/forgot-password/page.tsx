import Link from "next/link";
import { redirect } from "next/navigation";
import { ClientForgotPasswordForm } from "@/components/client/ClientForgotPasswordForm";
import { PortalLanguageSwitcher } from "@/components/client/portal/PortalLanguageSwitcher";
import { getPortalContent } from "@/content/i18n/portal";
import { siteConfig } from "@/content/site";
import { getOptionalClientSession } from "@/lib/auth/client-guards";
import { getPortalLocale } from "@/lib/i18n/portal-locale";

export default async function ClientForgotPasswordPage() {
  const session = await getOptionalClientSession();
  if (session) {
    redirect("/client/dashboard");
  }

  const locale = await getPortalLocale();
  const content = getPortalContent(locale);

  return (
    <div className="layout-stack-md">
      <div className="layout-stack-sm text-center">
        <Link href="/" className="font-display text-2xl text-ink no-underline">
          {siteConfig.name}
        </Link>
        <p className="type-caption">{content.forgotPassword.subtitle}</p>
      </div>

      <div className="flex justify-end">
        <PortalLanguageSwitcher locale={locale} label={content.languageSwitcherLabel} />
      </div>

      <div className="rounded-lg border border-border-subtle bg-surface p-6 md:p-8">
        <h1 className="type-heading-sm mb-6">{content.forgotPassword.title}</h1>
        <ClientForgotPasswordForm copy={content.forgotPassword} />
      </div>
    </div>
  );
}
