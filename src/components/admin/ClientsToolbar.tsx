"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { ClientListSort } from "@/lib/admin/client-types";

const SORT_OPTIONS: { value: ClientListSort; label: string }[] = [
  { value: "alphabetical", label: "Alphabetical" },
  { value: "newest", label: "Newest" },
  { value: "last_session", label: "Last session" },
  { value: "next_session", label: "Next session" },
];

export function ClientsToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const sort = (searchParams.get("sort") as ClientListSort | null) ?? "alphabetical";

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  function updateParams(nextQuery: string, nextSort: ClientListSort) {
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    if (nextSort !== "alphabetical") params.set("sort", nextSort);
    const search = params.toString();
    router.push(search ? `/admin/clients?${search}` : "/admin/clients");
  }

  return (
    <form
      className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      onSubmit={(event) => {
        event.preventDefault();
        updateParams(query, sort);
      }}
    >
      <div className="layout-stack-sm flex-1">
        <label htmlFor="client-search" className="type-caption text-ink-subtle">
          Search clients
        </label>
        <input
          id="client-search"
          name="q"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="First name, last name, or email"
          className="w-full min-h-12 rounded-md border border-border-subtle bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div className="layout-stack-sm md:w-56">
        <label htmlFor="client-sort" className="type-caption text-ink-subtle">
          Sort by
        </label>
        <select
          id="client-sort"
          name="sort"
          value={sort}
          onChange={(event) => updateParams(query, event.target.value as ClientListSort)}
          className="w-full min-h-12 rounded-md border border-border-subtle bg-surface px-4 py-3 text-base text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="min-h-12 rounded-md bg-ink px-5 py-3 type-body text-canvas"
      >
        Apply
      </button>
    </form>
  );
}
