"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setIdentityPublicAccessAction } from "@/lib/admin/actions/identity-test";

export function PublicAccessToggle({ enabled }: { enabled: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <span
        className={`type-caption inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-semibold ${
          enabled
            ? "border-booking bg-booking/10 text-booking-strong"
            : "border-line bg-surface-muted text-ink-subtle"
        }`}
      >
        <span
          aria-hidden
          className={`inline-block h-2 w-2 rounded-full ${enabled ? "bg-booking" : "bg-ink-muted"}`}
        />
        {enabled ? "IESLĒGTS — publiski pieejams" : "IZSLĒGTS — nav pieejams apmeklētājiem"}
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          const msg = enabled
            ? "Izslēgt publisko piekļuvi? Tests nekavējoties vairs nebūs pieejams apmeklētājiem."
            : "Ieslēgt publisko piekļuvi? Tests kļūs pieejams ikvienam bez uzaicinājuma.";
          if (!confirm(msg)) return;
          setError(null);
          start(async () => {
            try {
              await setIdentityPublicAccessAction(!enabled);
              router.refresh();
            } catch {
              setError("Neizdevās saglabāt — pārbaudiet, vai DB migrācija ir izpildīta.");
            }
          });
        }}
        className="type-caption rounded-full border border-accent px-4 py-2 text-accent disabled:opacity-40"
      >
        {enabled ? "Izslēgt" : "Ieslēgt"}
      </button>
      {error ? <span className="type-caption text-red-700">{error}</span> : null}
    </div>
  );
}
