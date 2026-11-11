"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { bulkPublishBeliefsAction } from "@/lib/admin/actions/identity-test";

export function BulkPublishButton() {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Publicēt visus DRAFT uzskatus? Pārbaudiet, ka fragmenti ir aizpildīti.")) return;
        start(async () => {
          await bulkPublishBeliefsAction();
          router.refresh();
        });
      }}
      className="type-caption rounded-full border border-accent px-4 py-2 text-accent disabled:opacity-40"
    >
      Publicēt visus melnrakstus
    </button>
  );
}
