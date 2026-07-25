import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { siteConfig } from "@/content/site";
import { getServerSession } from "@/lib/auth/session";

type AdminLoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const session = await getServerSession();
  if (session?.role === "ADMIN" && session.mfaVerified) {
    redirect("/admin");
  }

  const params = await searchParams;

  return (
    <div className="layout-stack-md">
      <div className="layout-stack-sm text-center">
        <Link href="/" className="font-display text-2xl text-ink no-underline">
          {siteConfig.name}
        </Link>
        <p className="type-caption">Admin sign in</p>
      </div>

      <div className="rounded-lg border border-border-subtle bg-surface p-6 md:p-8">
        <AdminLoginForm nextPath={params.next} initialError={params.error} />
      </div>
    </div>
  );
}
