"use client";

import { clientLogoutAction } from "@/lib/auth/client-actions";

export function ClientLogoutButton({ label }: { label: string }) {
  return (
    <form action={clientLogoutAction}>
      <button
        type="submit"
        className="min-h-11 rounded-full border border-[#e4d8c8] px-4 py-2 text-[#2c2824] transition-colors duration-200 hover:border-[#c4b49a]"
      >
        {label}
      </button>
    </form>
  );
}
