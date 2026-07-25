import { AdminPageHeader, AdminPanel } from "@/components/admin/AdminPageHeader";
import { adminPages } from "@/content/admin";

export default function AdminSettingsPage() {
  return (
    <div className="layout-stack-lg max-w-prose">
      <AdminPageHeader
        title={adminPages.settings.title}
        description={adminPages.settings.description}
      />

      <AdminPanel title="Authentication">
        <div className="observed-card p-6">
          <p className="type-body">
            Admin authentication is not yet enabled. Future integration will
            protect all /admin routes behind secure sign-in.
          </p>
        </div>
      </AdminPanel>

      <AdminPanel title="Integrations">
        <div className="layout-stack-sm">
          <div className="observed-card p-6">
            <p className="type-label">Database</p>
            <p className="type-body mt-2">
              Client profiles, sessions, and availability will persist through a
              dedicated data layer.
            </p>
          </div>
          <div className="observed-card p-6">
            <p className="type-label">Stripe</p>
            <p className="type-body mt-2">
              Payment records and checkout sessions will sync here once Stripe is
              connected.
            </p>
          </div>
          <div className="observed-card p-6">
            <p className="type-label">Client portal</p>
            <p className="type-body mt-2">
              Clients will access their session history and upcoming appointments
              through a separate private portal.
            </p>
          </div>
        </div>
      </AdminPanel>
    </div>
  );
}
