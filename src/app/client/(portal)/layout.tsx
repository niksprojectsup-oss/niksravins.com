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
      <header className="border-b border-border-subtle bg-canvas/90 backdrop-blur-sm lg:hidden">
        <div className="layout-container layout-wide py-4">
          <div className="flex min-h-[3rem] items-center justify-between gap-4">
            <Link href="/" className="font-display text-lg tracking-snug text-ink no-underline">
              {siteConfig.name}
            </Link>
            <p className="type-caption text-ink-subtle">Your space</p>
          </div>
          <ClientPortalNav variant="mobile" />
        </div>
      </header>

      <div className="layout-container layout-wide py-6 md:py-10 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 lg:py-12">
        <aside className="hidden lg:block">
          <div className="sticky top-8 layout-stack-md">
            <Link href="/" className="font-display text-lg tracking-snug text-ink no-underline">
              {siteConfig.name}
            </Link>
            <p className="type-caption text-ink-subtle">Your transformation space</p>
            <ClientPortalNav variant="sidebar" />
          </div>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
