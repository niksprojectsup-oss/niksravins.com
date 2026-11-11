"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { IdentityContentStatus } from "@prisma/client";

const STATUSES: IdentityContentStatus[] = ["DRAFT", "REVIEW", "APPROVED", "PUBLISHED", "DISABLED"];

type Props = {
  value: string;
  onSave: (status: IdentityContentStatus) => Promise<unknown>;
};

export function StatusControl({ value, onSave }: Props) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) =>
        start(async () => {
          await onSave(e.target.value as IdentityContentStatus);
          router.refresh();
        })
      }
      className="rounded-md border border-border bg-surface px-2 py-1 text-sm text-ink"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
