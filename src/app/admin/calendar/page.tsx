"use client";

import { useMemo, useState } from "react";
import { AdminCalendar } from "@/components/admin/AdminCalendar";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminPages } from "@/content/admin";
import { getMockCalendarSlots } from "@/lib/admin/mock-data";

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function AdminCalendarPage() {
  const [monthKey, setMonthKey] = useState(currentMonthKey());

  const slots = useMemo(() => getMockCalendarSlots(monthKey), [monthKey]);

  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader
        title={adminPages.calendar.title}
        description={adminPages.calendar.description}
      />
      <AdminCalendar
        slots={slots}
        monthKey={monthKey}
        onMonthChange={setMonthKey}
      />
    </div>
  );
}
