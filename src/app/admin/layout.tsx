import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <AdminSidebar />
      <div className="lg:pl-64">
        <div className="px-4 py-8 md:px-8 md:py-10">{children}</div>
      </div>
    </div>
  );
}
