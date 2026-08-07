import Link from "next/link";
import { redirect } from "next/navigation";
import { ClientSetPasswordForm } from "@/components/client/ClientSetPasswordForm";
import { clientPortalContent } from "@/content/client-portal";
import { siteConfig } from "@/content/site";
import { getOptionalClientSession } from "@/lib/auth/client-guards";

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

  if (!token) {
    redirect("/client/login?error=Invalid%20password%20link.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12 text-ink">
      <div className="w-full max-w-md layout-stack-md">
        <div className="layout-stack-sm text-center">
          <Link href="/" className="font-display text-2xl text-ink no-underline">
            {siteConfig.name}
          </Link>
          <p className="type-caption">{clientPortalContent.setPassword.subtitle}</p>
        </div>

        <div className="rounded-lg border border-border-subtle bg-surface p-6 md:p-8">
          <h1 className="type-heading-sm mb-6">{clientPortalContent.setPassword.title}</h1>
          <ClientSetPasswordForm token={token} />
        </div>
      </div>
    </div>
  );
}
