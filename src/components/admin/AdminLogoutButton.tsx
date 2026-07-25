import { logoutAction } from "@/lib/auth/actions";

export function AdminLogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="type-caption text-ink-subtle transition-colors duration-200 hover:text-ink"
      >
        Sign out
      </button>
    </form>
  );
}
