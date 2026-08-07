"use client";

import { clientLogoutAction } from "@/lib/auth/client-actions";
import { clientPortalContent } from "@/content/client-portal";

export function ClientLogoutButton() {
  return (
    <form action={clientLogoutAction}>
      <button
        type="submit"
        className="min-h-11 rounded-md border border-border-subtle px-4 py-2 type-body text-ink transition-colors duration-200 hover:border-border"
      >
        {clientPortalContent.dashboard.signOut}
      </button>
    </form>
  );
}
