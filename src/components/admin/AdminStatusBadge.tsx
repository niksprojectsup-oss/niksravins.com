import { cn } from "@/lib/utils";

type AdminStatusBadgeProps = {
  label: string;
  variant?: "default" | "accent" | "muted" | "warm";
};

const variants = {
  default: "bg-surface-muted text-ink-muted",
  accent: "bg-accent-soft text-accent-strong",
  muted: "bg-surface text-ink-subtle",
  warm: "bg-warm-soft text-warm",
};

export function AdminStatusBadge({
  label,
  variant = "default",
}: AdminStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium tracking-wide",
        variants[variant],
      )}
    >
      {label}
    </span>
  );
}

export function sessionStatusVariant(
  status: string,
): AdminStatusBadgeProps["variant"] {
  switch (status) {
    case "scheduled":
      return "accent";
    case "completed":
      return "default";
    case "cancelled":
    case "no-show":
      return "warm";
    default:
      return "muted";
  }
}

export function paymentStatusVariant(
  status: string,
): AdminStatusBadgeProps["variant"] {
  switch (status) {
    case "paid":
      return "accent";
    case "pending":
      return "muted";
    case "failed":
    case "refunded":
      return "warm";
    default:
      return "default";
  }
}
