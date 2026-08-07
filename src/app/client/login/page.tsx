import Link from "next/link";
import { redirect } from "next/navigation";
import { ClientLoginForm } from "@/components/client/ClientLoginForm";
import { clientPortalContent } from "@/content/client-portal";
import { siteConfig } from "@/content/site";
import { getOptionalClientSession } from "@/lib/auth/client-guards";

type ClientLoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function ClientLoginPage({ searchParams }: ClientLoginPageProps) {
  const session = await getOptionalClientSession();
  if (session) {
    redirect("/client/dashboard");
  }

  const params = await searchParams;

  return (
    <div className="layout-stack-md">
      <div className="layout-stack-sm text-center">
        <Link href="/" className="font-display text-2xl text-ink no-underline">
          {siteConfig.name}
        </Link>
        <p className="type-caption">{clientPortalContent.login.subtitle}</p>
      </div>

      <div className="rounded-lg border border-border-subtle bg-surface p-6 md:p-8">
        <h1 className="type-heading-sm mb-6">{clientPortalContent.login.title}</h1>
        <ClientLoginForm nextPath={params.next} initialError={params.error} />
      </div>
    </div>
  );
}
