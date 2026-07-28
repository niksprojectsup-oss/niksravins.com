import { AdminCalendarShell } from "@/components/admin/AdminCalendarShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminPages } from "@/content/admin";
import { getAdminCalendarSlots } from "@/lib/admin/session-repository";

type AdminCalendarPageProps = {
  searchParams: Promise<{ month?: string }>;
};

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default async function AdminCalendarPage({ searchParams }: AdminCalendarPageProps) {
  const params = await searchParams;
  const monthKey = params.month ?? currentMonthKey();
  const slots = await getAdminCalendarSlots(monthKey);

  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader
        title={adminPages.calendar.title}
        description={adminPages.calendar.description}
      />
      <AdminCalendarShell monthKey={monthKey} slots={slots} />
    </div>
  );
}
