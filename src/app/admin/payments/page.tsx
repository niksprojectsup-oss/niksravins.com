import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AdminStatusBadge,
  paymentStatusVariant,
} from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { adminPages } from "@/content/admin";
import { formatCurrency, mockPayments } from "@/lib/admin/mock-data";
import type { AdminPayment } from "@/lib/admin/types";

export default function AdminPaymentsPage() {
  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader
        title={adminPages.payments.title}
        description={adminPages.payments.description}
      />

      <AdminTable<AdminPayment>
        rows={mockPayments}
        columns={[
          {
            key: "client",
            header: "Client",
            cell: (row) => row.clientName,
          },
          {
            key: "session",
            header: "Session",
            cell: (row) => row.sessionLabel,
          },
          {
            key: "amount",
            header: "Amount",
            cell: (row) => formatCurrency(row.amountCents, row.currency),
          },
          {
            key: "status",
            header: "Status",
            cell: (row) => (
              <AdminStatusBadge
                label={row.status}
                variant={paymentStatusVariant(row.status)}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
