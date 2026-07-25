import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { requireAdmin } from "@/lib/auth/guards";

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <AdminSidebar />
      <div className="lg:pl-64">
        <div className="px-4 py-8 md:px-8 md:py-10">{children}</div>
      </div>
    </div>
  );
}
