import Link from "next/link";
import { ClientPortalNav } from "@/components/client/ClientPortalNav";
import { requireClient } from "@/lib/auth/client-guards";
import { siteConfig } from "@/content/site";

export const dynamic = "force-dynamic";

export default async function ClientPortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireClient();

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-border-subtle bg-canvas/90 backdrop-blur-sm">
        <div className="layout-container max-w-wide py-4">
          <div className="flex min-h-[3.5rem] items-center justify-between gap-4">
            <Link href="/" className="font-display text-lg tracking-snug text-ink no-underline">
              {siteConfig.name}
            </Link>
            <p className="type-caption hidden text-ink-subtle sm:block">Your space</p>
          </div>
          <ClientPortalNav />
        </div>
      </header>
      <main className="layout-container max-w-wide py-8 md:py-12">{children}</main>
    </div>
  );
}
