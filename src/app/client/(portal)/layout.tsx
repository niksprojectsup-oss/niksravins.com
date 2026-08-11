import Link from "next/link";
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
        <div className="layout-container flex min-h-[4.5rem] items-center justify-between py-4">
          <Link href="/" className="font-display text-lg tracking-snug text-ink no-underline">
            {siteConfig.name}
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/client/dashboard"
              className="type-caption text-ink-subtle no-underline hover:text-ink"
            >
              Dashboard
            </Link>
            <p className="type-caption text-ink-subtle">Client Portal</p>
          </div>
        </div>
      </header>
      <main className="layout-container max-w-wide py-10 md:py-14">{children}</main>
    </div>
  );
}
