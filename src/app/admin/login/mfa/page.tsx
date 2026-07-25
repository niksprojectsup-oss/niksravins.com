import Link from "next/link";

export default function AdminMfaPage() {
  return (
    <div className="layout-stack-md text-center">
      <div className="layout-stack-sm">
        <h1 className="font-display text-2xl text-ink">Two-factor verification</h1>
        <p className="type-body text-ink-subtle">
          Two-factor authentication is enabled for this account. Verification will be
          completed here when TOTP is configured.
        </p>
      </div>

      <div className="rounded-lg border border-border-subtle bg-surface p-6">
        <p className="type-caption text-ink-faint">
          Architecture prepared for TOTP verification. Contact the platform owner if you
          reached this screen unexpectedly.
        </p>
      </div>

      <Link href="/admin/login" className="type-caption text-ink-subtle no-underline">
        Back to sign in
      </Link>
    </div>
  );
}
