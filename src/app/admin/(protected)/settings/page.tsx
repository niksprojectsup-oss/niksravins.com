import { AdminPageHeader, AdminPanel } from "@/components/admin/AdminPageHeader";
import { AvailabilitySettingsForm } from "@/components/admin/AvailabilitySettingsForm";
import { adminPages } from "@/content/admin";
import { getAvailabilityConfig } from "@/lib/booking/availability/config-repository";

export default async function AdminSettingsPage() {
  const config = await getAvailabilityConfig();

  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader
        title={adminPages.settings.title}
        description={adminPages.settings.description}
      />

      <AdminPanel title="Online availability">
        <AvailabilitySettingsForm
          initialSettings={{
            minNoticeHours: config.settings.minNoticeHours,
            bufferMinutes: config.settings.bufferMinutes,
            horizonDays: config.settings.horizonDays,
            slotStepMinutes: config.settings.slotStepMinutes,
          }}
          initialWeekly={config.weekly.map((day) => ({
            dayOfWeek: day.dayOfWeek,
            enabled: day.enabled,
            startTime: day.startTime,
            endTime: day.endTime,
            note: day.note,
          }))}
          initialBlocks={config.blocks.map((block) => ({
            id: block.id,
            startTime: block.startTime,
            endTime: block.endTime,
            label: block.label,
            active: block.active,
          }))}
        />
      </AdminPanel>
    </div>
  );
}
