"use client";

import { useRouter } from "next/navigation";
import { AdminCalendar } from "@/components/admin/AdminCalendar";
import type { CalendarSlot } from "@/lib/admin/types";

type AdminCalendarShellProps = {
  monthKey: string;
  slots: CalendarSlot[];
};

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function AdminCalendarShell({ monthKey, slots }: AdminCalendarShellProps) {
  const router = useRouter();

  function handleMonthChange(nextMonthKey: string) {
    router.push(`/admin/calendar?month=${nextMonthKey}`);
  }

  return (
    <AdminCalendar
      slots={slots}
      monthKey={monthKey || currentMonthKey()}
      onMonthChange={handleMonthChange}
    />
  );
}
