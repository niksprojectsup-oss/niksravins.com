"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { restoreVersionAction } from "@/lib/admin/actions/identity-test";

export function VersionRestoreButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button type="button" disabled={pending}
      onClick={() => {
        if (!confirm("Atjaunot iepriekšējo versiju melnrakstā?")) return;
        start(async () => { await restoreVersionAction(id); router.refresh(); });
      }}
      className="type-caption text-accent disabled:opacity-40">
      Atjaunot
    </button>
  );
}
