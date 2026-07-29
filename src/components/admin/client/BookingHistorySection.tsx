import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { formatAdminDate, formatAdminDateTime } from "@/lib/admin/format";
import type { ClientBookingRecord } from "@/lib/admin/client-types";

export function BookingHistorySection({
  bookings,
}: {
  bookings: ClientBookingRecord[];
}) {
  return (
    <section className="observed-card p-6 md:p-8">
      <h2 className="type-heading-sm">Booking history</h2>
      {bookings.length > 0 ? (
        <ul className="mt-6 layout-stack-sm divide-y divide-border-subtle">
          {bookings.map((booking) => (
            <li key={booking.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="type-body text-ink">{booking.serviceTitle}</p>
                <p className="type-caption mt-1">
                  Session · {formatAdminDateTime(booking.scheduledAt)}
                </p>
                {booking.sessionIntention ? (
                  <p className="type-body mt-3 text-ink-subtle">{booking.sessionIntention}</p>
                ) : null}
              </div>
              <div className="layout-stack-sm sm:text-right">
                <AdminStatusBadge label={booking.status} variant="accent" />
                <p className="type-caption">Booked {formatAdminDate(booking.createdAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="type-body mt-4 text-ink-subtle">No bookings recorded yet.</p>
      )}
    </section>
  );
}
